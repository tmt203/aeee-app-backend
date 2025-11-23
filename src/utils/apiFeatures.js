class APIFeatures {
	constructor(query, queryString, model) {
		this.query = query; // Mongoose Query object
		this.model = model; // Model để build aggregation
		this.queryString = queryString;

		this.rootFilter = {};
		this.nestedFilters = {};

		this.populates = [];
		this.useAggregation = false; // Tự động bật nếu có nested filter

		this.sortBy = "-created_at";
		this.fields = "-__v";
		this.limit = 100;
		this.offset = 0;
	}

	// -----------------------------
	// Cast value helper
	// -----------------------------
	static castValue(v) {
		if (v === "true") return true;
		if (v === "false") return false;
		if (/^-?\d+$/.test(v)) return parseInt(v);
		if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
		return v;
	}

	buildOperator(operator, raw, casted) {
		return (
			{
				_eq: casted,
				_ne: { $ne: casted },
				_gt: { $gt: casted },
				_gte: { $gte: casted },
				_lt: { $lt: casted },
				_lte: { $lte: casted },
				_contains: { $regex: casted, $options: "i" },
				_in: { $in: raw.split(",").map(APIFeatures.castValue) },
			}[operator] || casted
		);
	}

	// -----------------------------
	// Build Filters
	// -----------------------------
	filter() {
		const queryObj = { ...this.queryString };
		const excluded = ["offset", "sort", "limit", "fields", "populate"];
		excluded.forEach((f) => delete queryObj[f]);

		Object.entries(queryObj).forEach(([key, rawValue]) => {
			let operator = null;
			const opList = ["_eq", "_ne", "_gt", "_gte", "_lt", "_lte", "_contains", "_in"];
			opList.forEach((o) => {
				if (key.endsWith(o)) operator = o;
			});

			const effectiveKey = operator ? key.replace(operator, "") : key;
			const value = APIFeatures.castValue(rawValue);

			// detect nested: a__b__c → path a.b.c
			const keyParts = effectiveKey.split("__");
			if (keyParts.length > 1) {
				this.useAggregation = true; // bật aggregation mode
				const [top, ...rest] = keyParts;
				const fieldPath = rest.join(".");

				if (!this.nestedFilters[top]) this.nestedFilters[top] = {};
				this.nestedFilters[top][fieldPath] = this.buildOperator(operator, rawValue, value);
				return;
			}

			// root filter
			this.rootFilter[effectiveKey] = this.buildOperator(operator, rawValue, value);
		});

		return this;
	}

	// -----------------------------
	// Sorting
	// -----------------------------
	sort() {
		this.sortBy = this.queryString.sort ? this.queryString.sort.split(",").join(" ") : this.sortBy;
		return this;
	}

	// -----------------------------
	// Field limiting
	// -----------------------------
	limitFields() {
		this.fields = this.queryString.fields?.split(",").join(" ") || this.fields;
		return this;
	}

	// -----------------------------
	// Pagination
	// -----------------------------
	paginate() {
		this.limit = this.queryString.limit * 1 || this.limit;
		this.offset = this.queryString.offset * 1 || 0;
		return this;
	}

	// -----------------------------
	// Populate support
	// -----------------------------
	populate(populateArray = []) {
		populateArray.forEach((pop) => {
			if (typeof pop === "string") {
				this.populates.push({
					path: pop,
					match: this.nestedFilters[pop] || {},
				});
			} else if (typeof pop === "object") {
				this.populates.push({
					...pop,
					match: {
						...(pop.match || {}),
						...(this.nestedFilters[pop.path] || {}),
					},
				});
			}
		});
		return this;
	}

	// -----------------------------
	// Get ref name from schema path
	// -----------------------------
	getRef(path) {
		const schemaType = this.model.schema.paths[path];
		if (!schemaType) return null;

		if (schemaType.options?.ref) return schemaType.options.ref;
		if (Array.isArray(schemaType.options?.type)) {
			const t = schemaType.options.type[0];
			if (t?.ref) return t.ref;
		}
		return null;
	}

	// -----------------------------
	// Build Aggregation Pipeline (when nested filters exist)
	// -----------------------------
	buildAggregation() {
		const pipeline = [];

		// 1. root filter
		if (Object.keys(this.rootFilter).length > 0) {
			pipeline.push({ $match: this.rootFilter });
		}

		// 2. lookup for all populate paths (not just nested filters)
		this.populates.forEach((pop) => {
			const path = pop.path;
			const ref = this.getRef(path);
			if (!ref) return;

			const isArray = Array.isArray(this.model.schema.paths[path]?.options?.type);

			pipeline.push({
				$lookup: {
					from: ref.toLowerCase() + "s", // Mongoose collection name heuristic
					localField: path,
					foreignField: "_id",
					as: path,
				},
			});

			// Only unwind if it's not an array (single reference)
			if (!isArray) {
				pipeline.push({ $unwind: { path: `$${path}`, preserveNullAndEmptyArrays: true } });
			}

			// Apply match conditions if any (from nested filters or explicit match)
			const matchConditions = pop.match || {};
			if (Object.keys(matchConditions).length > 0) {
				const matchObj = {};
				for (const [k, v] of Object.entries(matchConditions)) {
					matchObj[`${path}.${k}`] = v;
				}
				pipeline.push({ $match: matchObj });
			}
		});

		// 3. sort
		pipeline.push({ $sort: this.sortToObject(this.sortBy) });

		// 4. project fields
		if (this.fields) {
			const projection = {};
			this.fields.split(" ").forEach((f) => {
				if (f.startsWith("-")) projection[f.substring(1)] = 0;
				else projection[f] = 1;
			});
			pipeline.push({ $project: projection });
		}

		// 5. pagination
		pipeline.push({ $skip: this.offset }, { $limit: this.limit });

		return this.model.aggregate(pipeline);
	}

	sortToObject(sortStr) {
		return sortStr.split(" ").reduce((acc, key) => {
			if (key.startsWith("-")) acc[key.substring(1)] = -1;
			else acc[key] = 1;
			return acc;
		}, {});
	}

	// -----------------------------
	// Execute
	// -----------------------------
	exec() {
		if (this.useAggregation) {
			return this.buildAggregation();
		}

		let q = this.query
			.find(this.rootFilter)
			.sort(this.sortBy)
			.select(this.fields)
			.skip(this.offset)
			.limit(this.limit);

		this.populates.forEach((p) => (q = q.populate(p)));

		return q;
	}
}

export default APIFeatures;
