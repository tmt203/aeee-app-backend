import { Schema, model } from "mongoose";

const earlyAccessArticleSchema = new Schema(
	{
		title: { type: String, required: true },
		authors: [
			new Schema(
				{
					first_name: { type: String, required: true },
					last_name: { type: String, required: false },
				},
				{ _id: false }
			),
		],
		pdf_path: { type: String },
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

const EarlyAccessArticle = model("EarlyAccessArticle", earlyAccessArticleSchema);

export default EarlyAccessArticle;
