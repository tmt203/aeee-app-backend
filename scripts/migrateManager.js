import fs from "fs";
import mongoose from "mongoose";
import Manager from "../src/models/manager.model.js";

// Kết nối MongoDB
const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function migrate() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		// Đọc file manager.json
		const rawData = fs.readFileSync("./manager.json", "utf-8");
		const managers = JSON.parse(rawData);
		console.log(`📄 Found ${managers.length} managers`);

		// Map data sang schema
		const mappedManagers = managers.map((item) => ({
			volume: Number(item.volume),
			issue: Number(item.issue),
			foreword: item.foreword || "",
			avatar_url: item.manager_img || "",
			info_file_url: item.file_path || "",
		}));

		// Insert vào MongoDB
		await Manager.insertMany(mappedManagers, { ordered: false });
		console.log(`🎉 Migrated ${mappedManagers.length} managers`);

		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

migrate();
