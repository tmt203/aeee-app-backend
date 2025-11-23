import mongoose from "mongoose";
import Article from "../src/models/article.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function updateEarlyAccessArticles() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const articles = await Article.find({});
		console.log(`📄 Found ${articles.length} early access articles`);

		// For each early access article, get the first article's month and year
		for (const article of articles) {
			article.active = true;
			await article.save();
			console.log(`📝 Updated article "${article.title}" to active`);
		}

		console.log("🎉 Update completed");

		process.exit(0);
	} catch (error) {
		console.error("❌ Update failed:", error);
		process.exit(1);
	}
}

updateEarlyAccessArticles();
