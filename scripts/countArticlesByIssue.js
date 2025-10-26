import mongoose from "mongoose";
import Issue from "../src/models/issue.model.js";
import Article from "../src/models/article.model.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aeee_app";

async function syncArticlesToIssues() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const issues = await Issue.find({});
		console.log(`📚 Found ${issues.length} issues.`);

		let totalArticles = 0;
		for (const issue of issues) {
			const { volume, issue: issueNumber } = issue;

			// Find all articles that belong to this volume + issue
			const articles = await Article.find({
				volume: volume,
				issue: issueNumber,
			}).select("_id");

			totalArticles += articles.length;

			console.log(`vol ${volume}, issue ${issueNumber}:`, articles.length);
		}

		console.log("🎉 total articles:", totalArticles);
	} catch (error) {
		console.error("❌ Error during sync:", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Disconnected from MongoDB");
	}
}

syncArticlesToIssues();
