import Article from "../models/article.model.js";
import Issue from "../models/issue.model.js";
import Manager from "../models/manager.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const publishIssue = catchAsync(async (req, res, next) => {
	const { volume, issue } = req.body;

	const manager = await Manager.findOne({ volume, issue });

	if (!manager) {
		return next(new AppError("Volume issue not found", 404, "ERR_VOLUME_ISSUE_NOT_FOUND"));
	}

	const issueExisted = await Issue.findOne({ volume, issue });

	if (issueExisted) {
		// Sync articles in case new articles were added after publishing
		issueExisted.articles = await Article.find({ volume, issue, active: true }).select("_id");
		await issueExisted.save();

		return res.status(200).json({
			code: "OK",
			message: "Issue already published, articles synchronized",
			data: issueExisted,
		});
	}

	const articles = await Article.find({ volume, issue, active: true });
	const newIssue = await Issue.create({
		month: manager.month,
		year: manager.year,
		volume: manager.volume,
		issue: manager.issue,
		manager: manager._id,
		articles: articles.map((a) => a.id),
	});

	res.status(201).json({
		code: "OK",
		message: "Issue published successfully",
		data: newIssue,
	});
});

export const getAllIssues = factory.getAll(Issue, [
	{
		path: "articles",
		select: "id title authors pages doi views pub_date citations pdf_path -_id",
	},
	{
		path: "manager",
		select: "foreword foreword_content avatar_url name info_file_url active",
	},
]);
export const getIssue = factory.getOne(Issue);
export const createIssue = factory.createOne(Issue);
export const updateIssue = factory.updateOne(Issue);
export const deleteIssue = factory.deleteOne(Issue);
export const deleteIssues = factory.deleteMany(Issue);
