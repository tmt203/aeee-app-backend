import catchAsync from "./catchAsync.js";
import AppError from "./appError.js";
import APIFeatures from "./apiFeatures.js";

export const getAll = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let filter = {};
		let query = Model.find(filter);

		if (popOptions) query = query.populate(popOptions);
		const totalRecords = await Model.countDocuments(filter);

		const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

		const doc = await features.query;

		res.status(200).json({
			code: "OK",
			total: totalRecords,
			data: doc,
		});
	});

export const getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);

		const doc = await query;

		if (!doc) {
			return next(new AppError("There is no document with that ID", 404, "ERR_NOT_FOUND"));
		}

		res.status(200).json({
			code: "OK",
			data: doc,
		});
	});

export const createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);

		res.status(201).json({
			code: "OK",
			data: doc,
		});
	});

export const updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new AppError("No document found with that ID", 404, "ERR_NOT_FOUND"));
		}

		res.status(200).json({
			code: "OK",
			data: doc,
		});
	});

export const deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError("No document found with that ID", 404, "ERR_NOT_FOUND"));
		}

		res.status(200).json({
			code: "OK",
			data: null,
		});
	});

export const deleteMany = (Model) =>
	catchAsync(async (req, res, next) => {
		const filter = { _id: { $in: req.body.ids } };
		const result = await Model.deleteMany(filter);
		const deletedCount = result.deletedCount || 0;

		res.status(200).json({
			code: "OK",
			data: {
				deletedCount,
			},
		});
	});
