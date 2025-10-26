import mongoose from "mongoose";
import Article from "../src/models/article.model.js";
import { generateCitations } from "../src/utils/generateCitations.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app"; // 🔧 sửa nếu khác



async function updateAllCitations() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const articles = await Article.find({});
		console.log(`📚 Found ${articles.length} articles to update`);

		let updated = 0;

		for (const article of articles) {
			const newCitations = generateCitations(article);
			article.citations = newCitations;
			await article.save();
			updated++;
		}

		console.log(`🎉 Successfully updated citations for ${updated} articles.`);
	} catch (err) {
		console.error("❌ Error updating citations:", err);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Disconnected from MongoDB");
	}
}

updateAllCitations();
