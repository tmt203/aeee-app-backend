import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import EarlyAccessArticle from "../src/models/early_access_article.model.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/aeee_app"; // sửa nếu bạn dùng URI khác
const DATA_PATH = path.resolve("./early_access.json"); // đường dẫn tới file JSON

async function migrateEarlyAccess() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Đọc dữ liệu từ file JSON
    const rawData = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(rawData);
    console.log(`📄 Found ${data.length} early access articles`);

    // Xử lý dữ liệu phù hợp với model
    const formatted = data.map((item) => ({
      title: item.article_name?.trim(),
      authors: item.authors || [],
      pdf_path: "", // để trống theo yêu cầu
    }));

    // Xoá dữ liệu cũ (tùy chọn, có thể comment nếu bạn muốn giữ dữ liệu cũ)
    await EarlyAccessArticle.deleteMany({});
    console.log("🧹 Cleared existing early access articles");

    // Chèn dữ liệu mới
    const result = await EarlyAccessArticle.insertMany(formatted);
    console.log(`✅ Successfully imported ${result.length} early access articles`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

migrateEarlyAccess();
