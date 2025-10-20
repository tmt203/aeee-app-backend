import { Schema, model } from "mongoose";

const issueSchema = new Schema(
	{
		year: {
			type: Number,
			required: true,
		},
		volume: {
			type: Number,
			required: true,
		},
		issue: {
			type: Number,
			required: true,
		},
		manager: {
			type: Schema.Types.ObjectId,
			ref: "Manager",
			required: true,
		},
		articles: [
			{
				type: Number,
				ref: "Article",
			},
		],
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

// Compound index to optimize queries for latest issue
issueSchema.index({ volume: -1, issue: -1 });

// Middleware to populate `articles` and `manager` before returning
issueSchema.pre(/^find/, function (next) {
	this.populate({
		path: "articles",
		select: "id title authors views pub_date citations -_id",
	}).populate({
		path: "manager",
		select: "foreword foreword_content avatar_url name info_file_url",
	});
	next();
});

const Issue = model("Issue", issueSchema);

export default Issue;
