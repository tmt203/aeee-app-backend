import Manager from "../models/manager.model.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const getLatestManager = catchAsync(async (req, res, next) => {
	// Find max volume
	const latestManager = await Manager.findOne().sort({ volume: -1, issue: -1 });
	if (!latestManager) {
		return res.status(404).json({
			status: "error",
			message: "No manager found",
		});
	}
	res.status(200).json({
		status: "success",
		data: latestManager,
	});
});

export const getManager = factory.getOne(Manager);
export const getAllManagers = factory.getAll(Manager);
export const createManager = factory.createOne(Manager);
export const updateManager = factory.updateOne(Manager);
// export const deleteManager = factory.deleteOne(Manager);
// export const deleteManagers = factory.deleteMany(Manager);
