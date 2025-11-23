import mongoose from "mongoose";
import Article from "../src/models/article.model.js";

async function run() {
	await mongoose.connect("mongodb://localhost:27017/aeee_app");

	const articles = await Article.find();

	for (const oldArticle of articles) {
		const newId = String(oldArticle._id);

		// 1. Clone dữ liệu
		const obj = oldArticle.toObject();
		obj._id = newId;
		obj.id = newId;
		delete obj.__v;

		// 2. Tạo document mới
		await Article.create(obj);

		// 3. Xoá document cũ
		await Article.deleteOne({ _id: oldArticle._id });

		console.log("Converted:", oldArticle._id, "=>", newId);
	}

	console.log("DONE!");
	process.exit(0);
}

run().catch(console.error);
