import { Schema, model } from "mongoose";
import { generateCitations } from "../utils/generateCitations.js";

const articleSchema = new Schema(
	{
		_id: {
			type: Number,
			required: true,
		},
		id: {
			type: Number,
			required: true,
			unique: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
		},
		doi: {
			type: String,
			required: true,
			unique: true,
		},
		volume: {
			type: Number,
			required: true,
		},
		issue: {
			type: Number,
			required: true,
		},
		pages: new Schema(
			{
				first: {
					type: Number,
					required: true,
				},
				last: {
					type: Number,
					required: true,
				},
			},
			{
				_id: false,
			}
		),
		pub_date: new Schema(
			{
				year: {
					type: Number,
					required: true,
				},
				month: {
					type: Number,
					required: true,
				},
				day: {
					type: Number,
					required: true,
				},
				status: {
					type: String,
					enum: ["epublish"],
				},
			},
			{
				_id: false,
			}
		),
		history: [
			new Schema(
				{
					year: {
						type: Number,
						required: true,
					},
					month: {
						type: Number,
						required: true,
					},
					day: {
						type: Number,
						required: true,
					},
					status: {
						type: String,
						enum: ["received", "revised", "accepted", "published"],
					},
				},
				{
					_id: false,
				}
			),
		],
		authors: [
			new Schema(
				{
					first_name: { type: String, required: true },
					last_name: { type: String, required: false },
				},
				{ _id: false }
			),
		],
		abstract: {
			type: String,
			required: true,
		},
		language: {
			type: String,
			required: true,
			default: "en",
		},
		pdf_path: {
			type: String,
			required: true,
		},
		views: {
			type: Number,
			required: true,
			default: 0,
		},
		year: {
			type: Number,
			required: true,
		},
		category: {
			type: String,
			enum: [
				"Undefined",
				"Electrical and Electronic Engineering",
				"Physics and Optics",
				"Applied Mathematics",
				"Computer Science and Information Technology",
			],
			required: true,
		},
		citations: {
			apa: {
				type: String,
			},
			bib_tex: {
				type: String,
			},
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

// Middleware to generate citations before saving
articleSchema.pre("save", function (next) {
	if (this.isModified("authors") || this.isModified("title") || this.isModified("doi")) {
		const citations = generateCitations(this);
		this.citations = citations;
	}
	next();
});

const Article = model("Article", articleSchema);

export default Article;
