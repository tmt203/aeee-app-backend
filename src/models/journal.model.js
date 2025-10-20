import { Schema, model } from "mongoose";

const journalSchema = new Schema(
	{
		publisherName: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		issn: {
			type: String,
			required: true,
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

const Journal = model("Journal", journalSchema);

export default Journal;
