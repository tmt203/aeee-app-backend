import mongoose from "mongoose";
import Article from "../src/models/article.model.js";

const MONGODB_URI = "mongodb://localhost:27017/aeee_app"; // sửa lại cho đúng

const generateAPA = (article) => {
	const authors = article.authors
		.map((a, idx) => {
			const name = `${a.last_name}, ${a.first_name[0]}.`;
			return idx === article.authors.length - 1 && idx !== 0 ? `& ${name}` : name;
		})
		.join(", ");

	return `${authors} (${article.pub_date.year}). ${article.title}. Advances in Electrical and Electronic Engineering, ${article.volume}(${article.issue}), ${article.pages.first}-${article.pages.last}. doi:${article.doi}`;
};

const generateBibTex = (article) => {
	const authors = article.authors.map((a) => `${a.first_name} ${a.last_name}`).join(" and ");

	const key = article.doi.split(".").pop();

	return `@article{AEEE${key},
  author={${authors}},
  journal={Advances in Electrical and Electronic Engineering},
  title={${article.title}},
  year={${article.pub_date.year}},
  volume={${article.volume}},
  number={${article.issue}},
  pages={${article.pages.first}-${article.pages.last}},
  doi={${article.doi}},
  url={https://advances.vsb.cz/index.php/AEEE/article/view/${article.id}}
}`;
};

const run = async () => {
	await mongoose.connect(MONGODB_URI);
	const articles = await Article.find();

	console.log(`🧮 Found ${articles.length} articles, updating...`);

	for (const article of articles) {
		const apa = generateAPA(article);
		const bibtex = generateBibTex(article);

		article.citations = { apa, bib_tex: bibtex };
		await article.save();
	}

	console.log("✅ Migration complete!");
	await mongoose.disconnect();
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
