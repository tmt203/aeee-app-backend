import { Schema, model } from "mongoose";

const managerSchema = new Schema(
	{
		foreword: { type: String, required: true },
		foreword_content: String,
		avatar_url: { type: String, required: true },
		name: { type: String, required: false },
		info_file_url: { type: String, required: true },
		volume: { type: Number, required: true, min: 1 },
		issue: { type: Number, required: true, min: 1 },
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

const Manager = model("Manager", managerSchema);

export default Manager;
