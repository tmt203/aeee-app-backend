import path from "path";
import fs from "fs/promises";
import Article from "../models/article.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";
import { fileUploader } from "../utils/fileUploader.js";

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
			code: "OK",
			data: latest,
			total: latest.length,
		});
	} catch (error) {
		return next(new AppError("Failed to get latest articles", 500, "ERR_GET_LATEST_ARTICLES"));
	}
});

export const uploadSingle = fileUploader.single("file");
export const uploadFile = catchAsync(async (req, res, next) => {
	if (!req.file) {
		return next(new AppError("There is no file uploaded", 400, "ERR_NO_FILE"));
	}
	if (!req.query.folder) {
		return next(new AppError("Please provide folder name in query", 400, "ERR_NO_FOLDER"));
	}

	res.status(200).json({
		code: "OK",
		data: {
			file_path: `${req.query.folder}/${req.file.filename}`,
		},
	});
});

export const deleteFile = catchAsync(async (req, res, next) => {
	if (!req.query.filePath) {
		return next(
			new AppError(
				"Please provide folder name and file name in query",
				400,
				"ERR_NO_FOLDER_OR_NAME"
			)
		);
	}

	const filePath = path.join(process.cwd(), `/src/public/${req.query.filePath}`);

	// Check if file exists
	try {
		await fs.access(filePath);
	} catch {
		return next(new AppError("File does not exist", 404, "ERR_FILE_NOT_FOUND"));
	}

	// Delete the file
	await fs.unlink(filePath);
	res.status(200).json({
		code: "OK",
		data: null,
	});
});

export const deleteArticle = catchAsync(async (req, res, next) => {
	// Find article by ID
	const article = await Article.findById(req.params.id);

	// Delete file if exists
	if (article.pdf_path) {
		const filePath = path.join(process.cwd(), `/src/public/${article.pdf_path}`);
		try {
			await fs.access(filePath);
			await fs.unlink(filePath);
		} catch {
			// File does not exist, continue
		}
	}

	// Delete article document
	await Article.findByIdAndDelete(req.params.id);

	res.status(200).json({
		code: "OK",
		data: null,
	});
});

export const getArticle = factory.getOne(Article);
export const getAllArticles = factory.getAll(Article);
export const createArticle = factory.createOne(Article);
export const updateArticle = factory.updateOne(Article);
// export const deleteArticle = factory.deleteOne(Article);
// export const deleteArticles = factory.deleteMany(Article);
