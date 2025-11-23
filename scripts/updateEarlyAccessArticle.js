import mongoose from "mongoose";
import EarlyAccessArticle from "../src/models/early_access_article.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function updateEarlyAccessArticles() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const earlyAccessArticles = await EarlyAccessArticle.find({});
		console.log(`📄 Found ${earlyAccessArticles.length} early access articles`);

		// For each early access article, get the first article's month and year
		for (const article of earlyAccessArticles) {
			article.active = true;
			await article.save();
			console.log(`📝 Updated early access article "${article.title}" to active`);
		}

		console.log("🎉 Update completed");

		process.exit(0);
	} catch (error) {
		console.error("❌ Update failed:", error);
		process.exit(1);
	}
}

updateEarlyAccessArticles();
