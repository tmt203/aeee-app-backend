import mongoose from "mongoose";
import Issue from "../src/models/issue.model.js";
import Article from "../src/models/article.model.js";
import Manager from "../src/models/manager.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function updateIssues() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const issues = await Issue.find({});
		console.log(`📄 Found ${issues.length} issues`);

		for (const issue of issues) {
			const manager = await Manager.findOne({ volume: issue.volume, issue: issue.issue });

			if (manager && !issue.manager) {
				issue.manager = manager._id;
				await issue.save();
				console.log(`🔄 Updated Issue V${issue.volume} I${issue.issue} with Manager ID ${manager._id}`);
			}
		}

		console.log("🎉 Update completed");

		process.exit(0);
	} catch (error) {
		console.error("❌ Update failed:", error);
		process.exit(1);
	}
}

updateIssues();
