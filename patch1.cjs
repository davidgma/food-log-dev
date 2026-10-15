const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');

code = code.replace(
  "const nutritionByDate: Record<string, string[]> = {};",
  "const nutritionByDate: Record<string, string[]> = {};\n  const groceryImagesByDate: Record<string, string[]> = {};"
);

const matcher = `    const matchGroceries = file.match(/^(\\d{8}) groceries (w|o)\\.pdf$/);`;
const replacement = `    const matchGroceryImage = file.match(/^(\\d{8}) groceries f\\.png$/);
    if (matchGroceryImage) {
      const date = matchGroceryImage[1];
      if (!groceryImagesByDate[date]) groceryImagesByDate[date] = [];
      groceryImagesByDate[date].push(file);
      continue;
    }

    const matchGroceries = file.match(/^(\\d{8}) groceries (w|o)\\.pdf$/);`;

code = code.replace(matcher, replacement);

code = code.replace(
  "const allDates = Array.from(new Set([...Object.keys(groceriesByDate), ...Object.keys(daysFoodListByDate), ...Object.keys(nutritionByDate)])).sort((a, b) => b.localeCompare(a));",
  "const allDates = Array.from(new Set([...Object.keys(groceriesByDate), ...Object.keys(daysFoodListByDate), ...Object.keys(nutritionByDate), ...Object.keys(groceryImagesByDate)])).sort((a, b) => b.localeCompare(a));"
);

code = code.replace(
  "if (file.endsWith('.txt') || (file.endsWith('.pdf') && !file.endsWith('groceries w.pdf')))",
  "if (file.endsWith('.txt') || file.endsWith('.png') || (file.endsWith('.pdf') && !file.endsWith('groceries w.pdf')))"
);

fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
