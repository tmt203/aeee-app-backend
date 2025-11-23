import path from "path";
import fs from "fs/promises";
import Article from "../models/article.model.js";
import Manager from "../models/manager.model.js";
import Issue from "../models/issue.model.js";
import catchAsync from "../utils/catchAsync.js";
import * as factory from "../utils/handlerFactory.js";
import { fileUploader } from "../utils/fileUploader.js";
import AppError from "../utils/appError.js";

// export const downloadCrossReference = catchAsync(async (req, res, next) => {
// 	const { volume, issue } = req.body;
// 	if (!volume || !issue) {
// 		return next(
// 			new AppError("Please provide volume and issue in request body", 400, "ERR_NO_VOLUME_ISSUE")
// 		);
// 	}


// });

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
		code: "OK",
		data: latestManager,
	});
});

export const deleteManager = catchAsync(async (req, res, next) => {
	// Find manager by ID
	const manager = await Manager.findById(req.params.id);

	// If there is any article associated with this manager, prevent deletion
	const volume = manager.volume;
	const issue = manager.issue;
	const associatedArticles = await Article.find({ volume, issue });

	if (associatedArticles.length > 0) {
		return next(
			new AppError(
				`Please delete associated articles with this volume issue first.`,
				400,
				"ERR_MANAGER_HAS_ARTICLES"
			)
		);
	}

	// Delete avatar file if exists
	if (manager.avatar_url) {
		const avatarPath = path.join(process.cwd(), `/src/public/${manager.avatar_url}`);
		try {
			await fs.access(avatarPath);
			await fs.unlink(avatarPath);
		} catch {
			// File does not exist, continue
		}
	}

	// Delete info file if exists
	if (manager.info_file_url) {
		const infoFilePath = path.join(process.cwd(), `/src/public/${manager.info_file_url}`);
		try {
			await fs.access(infoFilePath);
			await fs.unlink(infoFilePath);
		} catch {
			// File does not exist, continue
		}
	}

	// Delete folder /src/public/uploads/articles/{year}/Vol {volume}, No {issue} if exists
	const folderPath = path.join(
		process.cwd(),
		`/src/public/uploads/articles/${manager.year}/Vol ${volume}, No ${issue}`
	);
	try {
		await fs.access(folderPath);
		await fs.rmdir(folderPath, { recursive: true });
	} catch {
		// Folder does not exist, continue
	}

	// Delete issue associated with this manager
	await Issue.findOneAndDelete({ manager: req.params.id });

	// Delete manager document
	await Manager.findByIdAndDelete(req.params.id);

	res.status(200).json({
		code: "OK",
		data: null,
	});
});

export const createManager = catchAsync(async (req, res, next) => {
	const {
		year,
		month,
		volume,
		issue,
		foreword,
		foreword_content,
		avatar_url,
		info_file_url,
		name,
	} = req.body;

	if (!year || !month || !volume || !issue) {
		return next(
			new AppError("Year, Month, Volume and Issue are required", 400, "ERR_MISSING_VOLUME_ISSUE")
		);
	}

	// Create a folder /src/public/uploads/articles/{year}/Vol {volume}, No {issue} if not exists
	const folderPath = path.join(
		process.cwd(),
		`/src/public/uploads/articles/${year}/Vol ${volume}, No ${issue}`
	);
	try {
		await fs.access(folderPath);
	} catch {
		await fs.mkdir(folderPath, { recursive: true });
	}

	// Create manager
	const newManager = await Manager.create({
		year,
		month,
		volume,
		issue,
		foreword,
		foreword_content,
		avatar_url,
		info_file_url,
		name,
	});

	res.status(200).json({
		code: "OK",
		data: newManager,
	});
});

export const getManager = factory.getOne(Manager);
export const getAllManagers = factory.getAll(Manager);
export const updateManager = factory.updateOne(Manager);
// export const createManager = factory.createOne(Manager);
// export const deleteManager = factory.deleteOne(Manager);
// export const deleteManagers = factory.deleteMany(Manager);
