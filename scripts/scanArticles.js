import fs from "fs";
import path from "path";

const rootDir = path.resolve("../src/public/uploads/articles");
const outputFile = path.resolve("articles_list.txt");

let results = [];

// Hàm duyệt thư mục
function readArticles(dir) {
	const years = fs.readdirSync(dir);
	years.forEach((year) => {
		const yearPath = path.join(dir, year);
		if (fs.statSync(yearPath).isDirectory()) {
			// duyệt Vol
			const vols = fs.readdirSync(yearPath);
			vols.forEach((vol) => {
				const volPath = path.join(yearPath, vol);
				if (fs.statSync(volPath).isDirectory()) {
					// duyệt categories
					const categories = fs.readdirSync(volPath);
					if (categories[0].endsWith(".pdf")) {
						// nếu không có category, duyệt thẳng files trong vol
						const files = fs.readdirSync(volPath);
						files.forEach((file) => {
							if (fs.statSync(path.join(volPath, file)).isFile()) {
								results.push({
									title: file.replace(/\.pdf$/i, ""),
									category: "",
									path: path.join(year, vol, file).replace(/\\/g, "/"),
								});
							}
						});
					} else {
						categories.forEach((cat) => {
							const catPath = path.join(volPath, cat);
							if (fs.statSync(catPath).isDirectory()) {
								// duyệt files trong category
								const files = fs.readdirSync(catPath);
								files.forEach((file) => {
									if (fs.statSync(path.join(catPath, file)).isFile()) {
										results.push({
											title: file.replace(/\.pdf$/i, ""),
											category: cat || "",
											path: path.join(year, vol, cat, file).replace(/\\/g, "/"),
										});
									}
								});
							}
						});
					}
				}
			});
		}
	});
}

readArticles(rootDir);

console.log("🔍 Đã quét xong. Tổng số bài viết tìm thấy:", results.length);

// Ghi ra file TXT
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), "utf8");

console.log(`✅ Done! Kết quả đã lưu tại: ${outputFile}`);
