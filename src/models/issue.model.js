import { Schema, model } from "mongoose";

const issueSchema = new Schema(
	{
		year: {
			type: Number,
			required: false,
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
			required: false,
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
		select: "id title authors pages doi views pub_date citations pdf_path -_id",
	}).populate({
		path: "manager",
		select: "foreword foreword_content avatar_url name info_file_url",
	});
	next();
});

// Middleware to sort by volume first, issue second in descending order after find
issueSchema.post(/^find/, function (docs, next) {
	if (Array.isArray(docs)) {
		docs.sort((a, b) => {
			if (a.volume === b.volume) {
				return b.issue - a.issue;
			}
			return b.volume - a.volume;
		});
	}
	next();
});

const Issue = model("Issue", issueSchema);

export default Issue;
