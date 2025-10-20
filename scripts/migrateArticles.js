import fs from "fs";
import mongoose from "mongoose";
import Article from "../src/models/article.model.js";

// Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/aeee_app";

function sanitizeFileName(name) {
	return name.replace(/[<>:"/\\|?*]/g, ""); // loại bỏ các ký tự cấm
}

function cosineSimilarity(str1, str2) {
	const tokenize = (s) =>
		s
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, "")
			.split(/\s+/)
			.filter(Boolean);

	const words1 = tokenize(str1);
	const words2 = tokenize(str2);

	const allWords = Array.from(new Set([...words1, ...words2]));
	const vec1 = allWords.map((w) => words1.filter((x) => x === w).length);
	const vec2 = allWords.map((w) => words2.filter((x) => x === w).length);

	const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
	const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
	const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

	if (mag1 === 0 || mag2 === 0) return 0;
	return dotProduct / (mag1 * mag2);
}

async function migrate() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		// Load articles.json
		const rawData = fs.readFileSync("./articles.json", "utf-8");
		const articles = JSON.parse(rawData);
		console.log(`📄 Found ${articles.length} articles`);

		// Load articles_list.txt (chứa danh sách {title, category})
		const listRaw = fs.readFileSync("./articles_list.txt", "utf-8");
		const articlesList = JSON.parse(listRaw);

		console.log(`📄 Found ${articlesList.length} articles in the list`);

		// Map data sang Article model format
		const mappedArticles = articles.map((item) => {
			let matchedCategory = "";
			let pdf_path = "";

			if (item.ArticleTitle) {
				let lowerTitle = item.ArticleTitle.toLowerCase();
				lowerTitle = sanitizeFileName(lowerTitle);

				for (const f of articlesList) {
					const similarity = cosineSimilarity(lowerTitle, f.title.toLowerCase());
					if (similarity >= 0.95) {
						matchedCategory = f.category || "Undefined";
						pdf_path = f.path;
						break;
					}
				}
			}

			return {
				_id: `${item.id}`,
				title: item.ArticleTitle,
				doi: item.ELocationID?.__text || "Undefined",
				volume: parseInt(item.Journal?.Volume),
				issue: parseInt(item.Journal?.Issue),
				pages: {
					first: parseInt(item.FirstPage),
					last: parseInt(item.LastPage),
				},
				pub_date: {
					year: item.Journal?.PubDate?.Year ? Number(item.Journal.PubDate.Year) : -1,
					month: item.Journal?.PubDate?.Month ? Number(item.Journal.PubDate.Month) : -1,
					day: item.Journal?.PubDate?.Day ? Number(item.Journal.PubDate.Day) : -1,
					status: item.Journal?.PubDate?._PubStatus || null,
				},
				history: (() => {
					if (!item.History?.PubDate) return [];
					const pubDates = Array.isArray(item.History.PubDate)
						? item.History.PubDate
						: [item.History.PubDate];

					return pubDates
						.map((h) => ({
							year: h.Year ? Number(h.Year) : null,
							month: h.Month ? Number(h.Month) : null,
							day: h.Day ? Number(h.Day) : null,
							status: h._PubStatus || null,
						}))
						.filter((h) => h.year && h.month && h.day); // loại NaN/null
				})(),
				authors: (() => {
					if (!item.AuthorList?.Author) return [];
					const authorData = item.AuthorList.Author;
					const list = Array.isArray(authorData) ? authorData : [authorData];
					return list.map((a) => ({
						first_name: a.FirstName || "",
						last_name: a.LastName || "",
					}));
				})(),
				abstract: item.Abstract || "Undefined",
				language: (item.Language || "EN").toLowerCase(),
				pdf_path,
				views: item.views || 0,
				year: parseInt(item.year),
				category: matchedCategory || "Undefined",
			};
		});

		// Insert vào MongoDB
		await Article.insertMany(mappedArticles, { ordered: false });
		console.log(`🎉 Migrated ${mappedArticles.length} articles`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

migrate();
