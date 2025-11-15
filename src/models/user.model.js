import crypto from "crypto";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		first_name: {
			type: String,
			required: [true, "ERR_FIRST_NAME_REQUIRED"],
			trim: true,
			maxlength: [50, "ERR_FIRST_NAME_MAXLENGTH"],
		},
		last_name: {
			type: String,
			required: [true, "ERR_LAST_NAME_REQUIRED"],
			trim: true,
			maxlength: [50, "ERR_LAST_NAME_MAXLENGTH"],
		},
		username: {
			type: String,
			required: [true, "ERR_USERNAME_REQUIRED"],
			unique: true,
			trim: true,
			lowercase: true,
			minlength: [3, "ERR_USERNAME_MINLENGTH"],
			maxlength: [30, "ERR_USERNAME_MAXLENGTH"],
		},
		email: {
			type: String,
			required: [true, "ERR_EMAIL_REQUIRED"],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, "ERR_EMAIL_INVALID"],
		},
		avatar: {
			type: String,
			default: "default.jpg",
		},
		role: {
			type: String,
			enum: ["admin", "user"],
		},
		password: {
			type: String,
			required: [true, "ERR_PASSWORD_REQUIRED"],
			minlength: [8, "ERR_PASSWORD_MINLENGTH"],
			select: false,
		},
		confirm_password: {
			type: String,
			required: function () {
				return this.isNew || this.isModified("password");
			},
			validate: {
				validator: function (e) {
					return e === this.password;
				},
				message: "ERR_PASSWORDS_NOT_MATCH",
			},
		},
		password_changed_at: Date,
		password_reset_token: String,
		password_reset_expires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		toJSON: {
			virtuals: true,
			versionKey: false,
			transform: function (_, ret) {
				delete ret._id;
				return ret;
			},
		},
	}
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.confirm_password = undefined;
	next();
});

// Middleware to update password_changed_at before saving
userSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) return next();
	this.password_changed_at = Date.now() - 1000;
	next();
});

// Middleware to filter out inactive users in find queries
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (candiatePassword, userPassword) {
	return await bcrypt.compare(candiatePassword, userPassword);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.password_changed_at) {
		const changedTimestamp = parseInt(this.password_changed_at.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.password_reset_token = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.password_reset_expires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
