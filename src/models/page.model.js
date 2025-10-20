import { Schema, model } from "mongoose";

const pageSchema = new Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		content: {
			type: String,
			required: true,
		},
		meta: {
			description: String,
			keywords: [String],
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

const Page = model("Page", pageSchema);

export default Page;
