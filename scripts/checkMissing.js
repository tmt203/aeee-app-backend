// checkMissing.js
import fs from "fs";
import mongoose from "mongoose";
import Article from "../src/models/article.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function checkMissing() {
	await mongoose.connect(MONGO_URI);
	console.log("✅ Connected to MongoDB");

	// Load file gốc
	const rawData = fs.readFileSync("./articles.json", "utf-8");
	const articles = JSON.parse(rawData);
	console.log("📄 Source records:", articles.length);

	const sourceIds = articles.map((a) => `${a.id}`);
	// check duplicate ids
	const uniqueIds = new Set(sourceIds);
	if (uniqueIds.size !== sourceIds.length) {
		console.log("⚠️ Warning: Duplicate IDs found in source data");

		// find and print duplicate ids
		const duplicates = sourceIds.filter((item, index) => sourceIds.indexOf(item) !== index);
		console.log("Duplicate IDs:", Array.from(new Set(duplicates)));
	}

	// Lấy id trong Mongo
	const dbIds = (await Article.find({}, { _id: 1 })).map((d) => `${d._id}`);
	console.log("🗄️ DB records:", dbIds.length);

	// Tìm missing
	const missing = sourceIds.filter((id) => !dbIds.includes(id));
	console.log("❌ Missing records:", missing);

	await mongoose.disconnect();
}

checkMissing();
