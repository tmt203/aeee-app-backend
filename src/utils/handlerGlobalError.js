import AppError from "./appError.js";
import { ERROR_MESSAGES } from "./constants.js";

const handleCastErrorDB = (err) => {
	return new AppError(`Invalid ${err.path}: ${err.value}.`, 400, "ERR_CAST_ERROR");
};

const handleDuplicateFieldsDB = (err) => {
	let value = "";
	const match = err.message.match(/(["'])(\\?.)*?\1/);
	if (match) value = match[0];

	return new AppError(
		`Duplicate field value: ${value}. Please use another value!`,
		400,
		"ERR_DUPLICATE_FIELD"
	);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join(". ")}`;

	return new AppError(message, 400, "ERR_VALIDATION_FAILED");
};

const handleJWTError = () =>
	new AppError("Invalid token. Please log in again!", 401, "ERR_JWT_INVALID");

const handleJWTExpiredError = () =>
	new AppError("Your token has expired! Please log in again.", 401, "ERR_JWT_EXPIRED");

const sendErrorDev = async (err, req, res) => {
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			code: err.errorCode || null,
			message: err.message,
			stack: err.stack,
		});
	}
};

const sendErrorProd = async (err, req, res) => {
	if (!req.originalUrl.startsWith("/api")) return;

	const isMongooseValidationError = err.errors && typeof err.errors === "object";

	if (isMongooseValidationError) {
		let errorCode = "ERR_VALIDATION_FAILED";

		for (const key in err.errors) {
			const e = err.errors[key];

			if (typeof e.message === "string") {
				if (e.message.startsWith("ERR_")) {
					return res.status(400).json({
						status: "fail",
						code: e.message,
						message: ERROR_MESSAGES[e.message] || "Validation failed",
					});
				}
			}
		}

		return res.status(400).json({
			status: "fail",
			code: errorCode,
			message: "Validation failed",
		});
	}

	// ✅ AppError hoặc lỗi đã biết
	if (err.isOperational) {
		// const errorId = await saveError(err);

		return res.status(err.statusCode).json({
			status: err.status,
			code: err.errorCode || "ERR_UNKNOWN",
			message: `${err.message}`,
		});
	}

	// ❌ Unknown Error
	console.error("ERROR 💥", err);

	return res.status(500).json({
		status: "error",
		code: "ERR_INTERNAL",
		message: "Something went wrong!",
	});
};

export default function globalErrorHandler(err, req, res, next) {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (!err.code) delete err.code;

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };
		error.message = err.message;

		if (error.name === "CastError") error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === "ValidationError") error = handleValidationErrorDB(error);
		if (error.name === "JsonWebTokenError") error = handleJWTError();
		if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

		sendErrorProd(error, req, res);
	}
}
