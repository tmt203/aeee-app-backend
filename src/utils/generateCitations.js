function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateCitations(article) {
	const { authors = [], pub_date, title, doi, volume, issue, pages, year, _id, id } = article;

	// 🧠 Helper: format họ tên kiểu APA (Lastname, F.)
	const formatAPAName = (a) => {
		const firstInitial = a.first_name?.charAt(0).toUpperCase() ?? "";
		const lastName =
			a.last_name?.charAt(0).toUpperCase() + (a.last_name?.slice(1)?.toLowerCase() ?? "");
		return `${lastName}, ${firstInitial}.`;
	};

	// 🔹 APA: nối authors với dấu phẩy, và “&” chỉ trước author cuối cùng
	let apaAuthors = "";
	if (authors.length === 1) {
		apaAuthors = formatAPAName(authors[0]);
	} else if (authors.length === 2) {
		apaAuthors = `${formatAPAName(authors[0])} & ${formatAPAName(authors[1])}`;
	} else if (authors.length > 2) {
		apaAuthors =
			authors
				.slice(0, -1)
				.map((a) => formatAPAName(a))
				.join(", ") + `, & ${formatAPAName(authors.at(-1))}`;
	}

	const apa = `${apaAuthors} (${
		pub_date?.year ?? year
	}). ${title}. Advances in Electrical and Electronic Engineering, ${volume}(${issue}), ${
		pages.first
	}-${pages.last}. doi:${doi}`;

	// 🔹 BibTeX: authors cách nhau bằng dấu phẩy
	const bibAuthors = authors.map((a) => `${a.first_name} ${capitalize(a.last_name)}`).join(", ");

	const bib_tex = `@article{AEEE${id ?? _id},
  author={${bibAuthors}},
  journal={Advances in Electrical and Electronic Engineering},
  title={${title}},
  year={${pub_date?.year ?? year}},
  volume={${volume}},
  number={${issue}},
  pages={${pages.first}-${pages.last}},
  doi={${doi}},
  url={https://advances.vsb.cz/index.php/AEEE/article/view/${id ?? _id}}
}`;

	return { apa, bib_tex };
}
