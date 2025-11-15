import path from "path";
import multer from "multer";
import AppError from "./appError.js";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!req.query.folder) {
			return cb(new AppError("There is no folder name in query", 400, "ERR_NO_FOLDER"), null);
		}

		const filePath = path.join(process.cwd(), `/src/public/${req.query.folder}`);
		cb(null, filePath);
	},
	filename: (req, file, cb) => {
		const name = req.query.name || file.originalname;
		cb(null, name);
	},
});

export const fileUploader = multer({ storage });
