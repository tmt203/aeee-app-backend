import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import * as factory from "../utils/handlerFactory.js";
import User from "../models/user.model.js";

// ------------------------------------------------------------------------------------------------------

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((e) => {
		if (allowedFields.includes(e)) newObj[e] = obj[e];
	});
	return newObj;
};

// ------------------------------------------------------------------------------------------------------

export const getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

export const updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		return next(new AppError("This route is not for update password", 400, "ERR_UPDATE_PASSWORD"));
	}

	const filteredBody = filterObj(req.body, "name", "email", "avatar", "address", "payment_method");
	if (req.file) filteredBody.avatar = req.file.filename;

	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		code: "OK",
		data: { user: updatedUser },
	});
});

export const deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({
		code: "OK",
		data: null,
	});
});

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
