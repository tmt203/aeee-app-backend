import mongoose from "mongoose";
import Manager from "../src/models/manager.model.js";
import Issue from "../src/models/issue.model.js";
import Article from "../src/models/article.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function updateIssueYears() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const issues = await Issue.find();
		console.log(`🔍 Found ${issues.length} issues`);

		let updatedCount = 0;

		for (const issue of issues) {
			if (!issue.articles || issue.articles.length === 0) continue;

			const firstArticleId = issue.articles[0];
			const article = await Article.findOne({ id: firstArticleId.id });

			if (article && article.pub_date?.year) {
				issue.year = article.pub_date.year;
				await issue.save();
				updatedCount++;
				console.log(`✅ Updated issue ${issue._id} -> year = ${issue.year}`);
			} else {
				console.log(`⚠️ No valid pub_date.year found for article ID ${firstArticleId}`);
			}
		}

		console.log(`🎯 Done! Updated ${updatedCount} issues`);
		process.exit(0);
	} catch (err) {
		console.error("❌ Error updating issues:", err);
		process.exit(1);
	}
}

updateIssueYears();
