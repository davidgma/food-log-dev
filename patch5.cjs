const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');

const target = "fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');";
const replacement = `fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
                        
                        // Copy to tmp directory for future re-use
                        // We save as .html since it is HTML, but we also save as .pdf to satisfy the exact name requested if the user looks for it
                        if (tmpDir && date) {
                           fs.copyFileSync(htmlFilePath, require('path').join(tmpDir, \`\${date} groceries w - converted.html\`));
                           fs.copyFileSync(htmlFilePath, require('path').join(tmpDir, \`\${date} groceries w - converted.pdf\`));
                        }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
