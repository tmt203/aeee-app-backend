class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		const queryObj = { ...this.queryString };
		const excludedFields = ["offset", "sort", "limit", "fields"];
		excludedFields.forEach((e) => delete queryObj[e]);

		const parsedQuery = {};

		Object.entries(queryObj).forEach(([key, value]) => {
			if (key.endsWith("_eq")) {
				// Exact match
				const field = key.replace("_eq", "");
				parsedQuery[field] = value;
			} else if (key.endsWith("_contains")) {
				// Contains (substring, case-insensitive)
				const field = key.replace("_contains", "");
				parsedQuery[field] = { $regex: value, $options: "i" };
			} else if (key.endsWith("_in")) {
				// In list (comma-separated)
				const field = key.replace("_in", "");
				parsedQuery[field] = { $in: value.split(",") };
			} else {
				// fallback: keep the original key-value pair
				parsedQuery[key] = value;
			}
		});

		this.query = this.query.find(parsedQuery);

		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort("-created_at");
		}

		return this;
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(",").join(" ");
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select("-__v");
		}

		return this;
	}

	paginate() {
		const limit = this.queryString.limit * 1 || 100;
		const offset = this.queryString.offset * 1 || 0;

		this.query = this.query.skip(offset).limit(limit);

		return this;
	}
}

export default APIFeatures;
