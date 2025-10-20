import Issue from "../models/issue.model.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const getLatestIssue = catchAsync(async (req, res, next) => {
	try {
		// lean() fast because no need to convert to mongoose doc
		const latestIssue = await Issue.findOne().sort({ volume: -1, issue: -1 }).limit(1).lean();

		if (!latestIssue) {
			return res.status(404).json({ code: "ERR_NOT_FOUND", message: "No issues found" });
		}

		res.status(200).json({
			code: "OK",
			data: latestIssue,
		});
	} catch (error) {
		console.error("Error fetching latest issue:", error);
		res.status(500).json({ code: "ERR_INTERNAL", message: "Internal server error" });
	}
});

export const getIssue = factory.getOne(Issue);
export const getAllIssues = factory.getAll(Issue);
export const createIssue = factory.createOne(Issue);
export const updateIssue = factory.updateOne(Issue);
export const deleteIssue = factory.deleteOne(Issue);
export const deleteIssues = factory.deleteMany(Issue);
