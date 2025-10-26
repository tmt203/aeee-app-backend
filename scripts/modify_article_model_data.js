import mongoose from "mongoose";
import Article from "../src/models/article.model.js";
import Manager from "../src/models/manager.model.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/aeee_app"; // hoặc URI bạn đang dùng

async function updatePdfPaths() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const articles = await Article.find({});
		console.log(`📄 Found ${articles.length} articles`);

		let updatedCount = 0;

		// for (const article of articles) {
		//   // Nếu chưa có prefix /uploads/articles/
		//   if (!article.pdf_path.startsWith("/uploads/articles/")) {
		//     article.pdf_path = `/uploads/articles/${article.pdf_path.replace(/^\/+/, "")}`;
		//     await article.save();
		//     updatedCount++;
		//   }
		// }

		for (const article of articles) {
			article._id = undefined; // Xóa trường _id cũ
			await article.save();
			updatedCount++;
		}

		console.log(`✅ Updated ${updatedCount} articles successfully`);
	} catch (err) {
		console.error("❌ Error updating articles:", err);
	} finally {
		await mongoose.disconnect();
	}
}

updatePdfPaths();
