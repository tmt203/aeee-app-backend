import crypto from "crypto";
import validator from "validator";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../models/user.model.js";

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	res.cookie("jwt", token, {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600000),
		httpOnly: true,
		secure: req.secure || req.headers["x-forwarded-proto"] === "https",
	});

	user.password = undefined;

	res.status(statusCode).json({
		code: "OK",
		token,
		data: user,
	});
};

export const signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		confirm_password: req.body.confirm_password,
		role: req.body.role || "user",
	});

	createSendToken(newUser, 201, req, res);
});

export const signin = catchAsync(async (req, res, next) => {
	const { identifier, password } = req.body;

	if (!identifier || !password) {
		return next(
			new AppError(
				"Username/Email and password are required",
				400,
				"ERR_IDENTIFIER_PASSWORD_REQUIRED"
			)
		);
	}

	// Check if identifier is email or username
	const query = validator.isEmail(identifier)
		? { email: identifier.toLowerCase() }
		: { username: identifier.toLowerCase() };

	const user = await User.findOne(query).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect username/email or password", 401, "ERR_INCORRECT_LOGIN"));
	}

	createSendToken(user, 200, req, res);
});

export const logout = (req, res) => {
	res.cookie("jwt", "loggedout", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ code: "OK" });
};

export const protect = catchAsync(async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new AppError("You are not logged in!", 401, "ERR_NOT_LOGGED_IN"));
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	const currentUser = await User.findById(decoded.id);

	if (!currentUser) {
		return next(
			new AppError("The user belong to this token no longer exist", 401, "ERR_USER_NOT_FOUND")
		);
	}

	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("User recently changed password! Plese login again", 401, "ERR_PASSWORD_CHANGED")
		);
	}

	req.user = currentUser;
	res.locals.user = currentUser;
	next();
});

export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403, "ERR_FORBIDDEN")
			);
		}

		next();
	};
};

export const forgotPassword = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError("There is no user match email", 404, "ERR_USER_NOT_FOUND"));
	}
	const resetToken = user.createpassword_reset_token();
	await user.save({ validateBeforeSave: false });

	res.status(200).json({
		code: "OK",
		message: "Reset token will expire after 10 minutes",
		data: { resetToken },
	});
});

export const resetPassword = catchAsync(async (req, res, next) => {
	const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hext");

	const user = await User.findOne({
		password_reset_token: hashedToken,
		password_reset_expires: { $gt: Date.now() },
	});

	if (!user) {
		return next(
			new AppError("Token is invalid or has expired", 400, "ERR_INVALID_OR_EXPIRED_TOKEN")
		);
	}

	user.password = req.body.password;
	user.confirm_password = req.body.confirm_password;
	user.password_reset_token = undefined;
	user.password_reset_expires = undefined;
	await user.save();

	createSendToken(user, 200, req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	if (!(await user.correctPassword(req.body.password_current, user.password))) {
		return next(new AppError("Current password is wrong", 401, "ERR_INCORRECT_PASSWORD"));
	}

	user.password = req.body.password;
	user.confirm_password = req.body.confirm_password;
	await user.save();

	createSendToken(user, 200, req, res);
});

export const verifyToken = catchAsync(async (req, res, next) => {
	const { user } = req;

	res.status(200).json({ code: "OK", message: "Token is valid", data: { user } });
});
