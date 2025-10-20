import Article from "../models/article.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";

export const getLatestArticles = catchAsync(async (req, res, next) => {
	try {
		const latest = await Article.aggregate([
			// find the max volume
			{ $group: { _id: null, maxVolume: { $max: "$volume" } } },
			{
				$lookup: {
					from: "articles",
					let: { volume: "$maxVolume" },
					pipeline: [
						{ $match: { $expr: { $eq: ["$volume", "$$volume"] } } },
						// find the max issue in that volume
						{ $group: { _id: null, maxIssue: { $max: "$issue" } } },
						{
							$lookup: {
								from: "articles",
								let: { volume: "$$volume", issue: "$maxIssue" },
								pipeline: [
									{
										$match: {
											$expr: {
												$and: [{ $eq: ["$volume", "$$volume"] }, { $eq: ["$issue", "$$issue"] }],
											},
										},
									},
								],
								as: "articles",
							},
						},
						{ $unwind: "$articles" },
						{ $replaceRoot: { newRoot: "$articles" } },
					],
					as: "articles",
				},
			},
			{ $unwind: "$articles" },
			{ $replaceRoot: { newRoot: "$articles" } },
		]);

		return res.status(200).json({
			status: "OK",
			data: latest,
			total: latest.length,
		});
	} catch (error) {
		return next(new AppError("Failed to get latest articles", 500, "ERR_GET_LATEST_ARTICLES"));
	}
});

export const getArticle = factory.getOne(Article);
export const getAllArticles = factory.getAll(Article);
export const createArticle = factory.createOne(Article);
export const updateArticle = factory.updateOne(Article);
// export const deleteArticle = factory.deleteOne(Article);
// export const deleteArticles = factory.deleteMany(Article);
