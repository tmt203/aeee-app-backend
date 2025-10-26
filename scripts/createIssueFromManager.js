// updateIssueManagers.js
import mongoose from "mongoose";
import Article from "../src/models/article.model.js";
import Manager from "../src/models/manager.model.js";
import Issue from "../src/models/issue.model.js";

const MONGO_URI = "mongodb://localhost:27017/aeee_app"; // đổi nếu DB khác

async function updateIssueManagers() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected to MongoDB");

		const managers = await Manager.find({});
		console.log(`👨‍💼 Found ${managers.length} managers`);

		let updatedCount = 0;

		for (const manager of managers) {
			const { volume, issue, _id } = manager;

			const result = await Issue.findOneAndUpdate(
				{ volume, issue },
				{ manager: _id },
				{ new: true }
			);

			if (result) {
				updatedCount++;
				console.log(
					`🔄 Linked manager ${manager.name || "(no name)"} → Vol ${volume}, No ${issue}`
				);
			} else {
				console.warn(`⚠️ No Issue found for Vol ${volume}, No ${issue}`);
			}
		}

		console.log(`✅ Done. Updated ${updatedCount} issues with manager links.`);
		process.exit(0);
	} catch (err) {
		console.error("❌ Error updating Issue managers:", err);
		process.exit(1);
	}
}

updateIssueManagers();
