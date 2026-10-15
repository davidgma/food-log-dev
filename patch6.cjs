const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');

const target1 = `        const cachedPdfPath = path.join(tmpDir, \`\${date} groceries w - converted.pdf\`);
        const cachedHtmlPath = path.join(tmpDir, \`\${date} groceries w - converted.html\`);
        if (fs.existsSync(cachedPdfPath)) {
          console.log(\`Using cached converted PDF for \${file}\`);
          fs.copyFileSync(cachedPdfPath, path.join(outputDir, \`\${date} groceries w - converted.pdf\`));
          waitroseCachedFile = \`\${date} groceries w - converted.pdf\`;
        } else if (fs.existsSync(cachedHtmlPath)) {
          console.log(\`Using cached converted HTML for \${file}\`);
          fs.copyFileSync(cachedHtmlPath, path.join(outputDir, file.replace('.pdf', '.html')));
          waitroseCachedFile = file.replace('.pdf', '.html');
        } else {
          processWaitrosePdf(path.join(inputDir, file), outputDir, tmpDir, date);
        }`;

const replacement1 = `        const cachedHtmlPath = path.join(tmpDir, \`\${date} groceries w - converted.html\`);
        if (fs.existsSync(cachedHtmlPath)) {
          console.log(\`Using cached converted HTML for \${file}\`);
          fs.copyFileSync(cachedHtmlPath, path.join(outputDir, file.replace('.pdf', '.html')));
          waitroseCachedFile = file.replace('.pdf', '.html');
        } else {
          processWaitrosePdf(path.join(inputDir, file), outputDir, tmpDir, date);
        }`;

code = code.replace(target1, replacement1);

const target2 = `                        // Copy to tmp directory for future re-use
                        // We save as .html since it is HTML, but we also save as .pdf to satisfy the exact name requested if the user looks for it
                        if (tmpDir && date) {
                           fs.copyFileSync(htmlFilePath, require('path').join(tmpDir, \`\${date} groceries w - converted.html\`));
                           fs.copyFileSync(htmlFilePath, require('path').join(tmpDir, \`\${date} groceries w - converted.pdf\`));
                        }`;

const replacement2 = `                        // Copy to tmp directory for future re-use
                        if (tmpDir && date) {
                           fs.copyFileSync(htmlFilePath, require('path').join(tmpDir, \`\${date} groceries w - converted.html\`));
                        }`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
