import fs from "fs";
import path from "path";

const rootDir = path.join(process.cwd(), "src/uploads/articles");

// only read folder from 2002 to 2025
const years = Array.from({ length: 2025 - 2002 + 1 }, (_, i) => (2002 + i).toString());

function listCategories() {
    const categories = new Set();
    let article_category = [];

    for (const year of years) {
        const yearPath = path.join(rootDir, year);

        if (!fs.existsSync(yearPath)) continue;

        // read folders "Vol x, No y"
        const vols = fs.readdirSync(yearPath, { withFileTypes: true }).filter(d => d.isDirectory());

        for (const vol of vols) {
            const volPath = path.join(yearPath, vol.name);

            // read folder categories in vol
            const cats = fs.readdirSync(volPath, { withFileTypes: true }).filter(d => d.isDirectory());

            for (const cat of cats) {
                // categories.add(cat.name);

                // read files in category
                
            }
        }
    }

    console.log("Categories found:", Array.from(categories));
}

listCategories();