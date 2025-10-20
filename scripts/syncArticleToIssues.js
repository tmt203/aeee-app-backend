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

		for (const issue of issues) {
			const { volume, issue: issueNumber } = issue;

			// Find all articles that belong to this volume + issue
			const articles = await Article.find({
				volume: volume,
				issue: issueNumber,
			}).select("_id");

			if (!articles.length) {
				console.log(`⚠️ No articles found for Volume ${volume}, Issue ${issueNumber}`);
				continue;
			}

			// Extract IDs
			const articleIds = articles.map((a) => a._id);

			// Update the Issue
			issue.articles = articleIds;
			await issue.save();

			console.log(
				`✅ Updated Issue V${volume} I${issueNumber}: linked ${articles.length} articles`
			);
		}

		console.log("🎉 Sync completed successfully!");
	} catch (error) {
		console.error("❌ Error during sync:", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Disconnected from MongoDB");
	}
}

syncArticlesToIssues();
