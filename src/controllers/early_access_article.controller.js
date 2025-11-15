import path from "path";
import fs from "fs/promises";
import EarlyAccessArticle from "../models/early_access_article.model.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";
import { fileUploader } from "../utils/fileUploader.js";
import AppError from "../utils/appError.js";

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

export const deleteEarlyAccessArticle = catchAsync(async (req, res, next) => {
	// Find manager by ID
	const earlyAccessArticle = await EarlyAccessArticle.findById(req.params.id);

	// Delete file if exists
	if (earlyAccessArticle.pdf_path) {
		const filePath = path.join(process.cwd(), `/src/public/${earlyAccessArticle.pdf_path}`);
		try {
			await fs.access(filePath);
			await fs.unlink(filePath);
		} catch {
			// File does not exist, continue
		}
	}

	// Delete manager document
	await EarlyAccessArticle.findByIdAndDelete(req.params.id);

	res.status(200).json({
		code: "OK",
		data: null,
	});
});

export const getEarlyAccessArticle = factory.getOne(EarlyAccessArticle);
export const getAllEarlyAccessArticles = factory.getAll(EarlyAccessArticle);
export const createEarlyAccessArticle = factory.createOne(EarlyAccessArticle);
export const updateEarlyAccessArticle = factory.updateOne(EarlyAccessArticle);
// export const deleteEarlyAccessArticle = factory.deleteOne(EarlyAccessArticle);
// export const deleteEarlyAccessArticles = factory.deleteMany(EarlyAccessArticle);
