const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');
code = code.replace(
  "const outputDir = path.resolve(process.cwd(), 'dist');",
  "const outputDir = path.resolve(process.cwd(), 'food-log', 'docs');"
);
fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
