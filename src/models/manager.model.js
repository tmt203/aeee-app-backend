import { Schema, model } from "mongoose";

const managerSchema = new Schema(
	{
		foreword: { type: String, required: false },
		foreword_content: { type: String, required: false },
		avatar_url: { type: String, required: false },
		name: { type: String, required: false },
		info_file_url: { type: String, required: false },
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

managerSchema.index({ volume: 1, issue: 1 }, { unique: true });

const Manager = model("Manager", managerSchema);

export default Manager;
