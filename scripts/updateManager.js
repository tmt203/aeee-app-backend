import mongoose from "mongoose";
import Manager from "../src/models/manager.model.js";
import Article from "../src/models/article.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app";

async function updateManagers() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const managers = await Manager.find({});
		console.log(`📄 Found ${managers.length} managers`);

		// For each manager, get the first article's month and year
		for (const manager of managers) {
			manager.active = true;
			await manager.save();
			console.log(`🔄 Updated manager for Volume ${manager.volume}, Issue ${manager.issue}`);
		}

		console.log("🎉 Update completed");

		process.exit(0);
	} catch (error) {
		console.error("❌ Update failed:", error);
		process.exit(1);
	}
}

updateManagers();
