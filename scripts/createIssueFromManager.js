import mongoose from "mongoose";
import Article from "../src/models/article.model.js";
import Manager from "../src/models/manager.model.js";
import Issue from "../src/models/issue.model.js";

async function createIssuesFromManagers() {
	try {
		// Kết nối MongoDB
		await mongoose.connect("mongodb://127.0.0.1:27017/aeee_app");
		console.log("✅ Connected to MongoDB");

		// Lấy danh sách managers
		const managers = await Manager.find({});
		if (!managers.length) {
			console.log("⚠️ No managers found.");
			return;
		}

		console.log(`📘 Found ${managers.length} managers.`);

		for (const manager of managers) {
			const { volume, issue, _id } = manager;

			// Kiểm tra xem Issue đã tồn tại chưa
			const existingIssue = await Issue.findOne({ volume, issue });

			if (existingIssue) {
				console.log(`🔁 Issue V${volume} I${issue} already exists → skipping.`);

				// Nếu muốn cập nhật lại manager:
				// existingIssue.manager = _id;
				// await existingIssue.save();
				continue;
			}

			// Tạo mới Issue
			const newIssue = new Issue({
				volume,
				issue,
				manager: _id,
				articles: [],
			});

			await newIssue.save();
			console.log(`✅ Created Issue V${volume} I${issue}`);
		}

		console.log("🎉 Done creating issues from managers!");
	} catch (err) {
		console.error("❌ Error during creation:", err);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Disconnected MongoDB");
	}
}

createIssuesFromManagers();
