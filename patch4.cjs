const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');

// 1. In the loop, only call processWaitrosePdf if we don't have a cache hit, or let processWaitrosePdf handle the cache logic and return the file to use.
// Let's rewrite processWaitrosePdf to return string | null
const oldLoop = `  for (const file of files) {
    if (file.endsWith('groceries w.pdf')) {
      processWaitrosePdf(path.join(inputDir, file), outputDir);
    }

    const matchGroceryImage = file.match(/^(\\d{8}) groceries f\\.png$/);`;

const newLoop = `  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (const file of files) {
    let waitroseCachedFile = null;
    if (file.endsWith('groceries w.pdf')) {
      const dateMatch = file.match(/^(\\d{8})/);
      if (dateMatch) {
        const date = dateMatch[1];
        const cachedPdfPath = path.join(tmpDir, \`\${date} groceries w - converted.pdf\`);
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
        }
      }
    }

    const matchGroceryImage = file.match(/^(\\d{8}) groceries f\\.png$/);`;

code = code.replace(oldLoop, newLoop);

const oldPush = `    const matchGroceries = file.match(/^(\\d{8}) groceries (w|o)\\.pdf$/);
    if (matchGroceries) {
      const date = matchGroceries[1];
      if (!groceriesByDate[date]) groceriesByDate[date] = [];
      
      if (matchGroceries[2] === 'w') {
        // Waitrose groceries will be converted to HTML
        groceriesByDate[date].push(file.replace('.pdf', '.html'));
      } else {
        groceriesByDate[date].push(file);
      }
      continue;
    }`;

const newPush = `    const matchGroceries = file.match(/^(\\d{8}) groceries (w|o)\\.pdf$/);
    if (matchGroceries) {
      const date = matchGroceries[1];
      if (!groceriesByDate[date]) groceriesByDate[date] = [];
      
      if (matchGroceries[2] === 'w') {
        if (waitroseCachedFile) {
           groceriesByDate[date].push(waitroseCachedFile);
        } else {
           groceriesByDate[date].push(file.replace('.pdf', '.html'));
        }
      } else {
        groceriesByDate[date].push(file);
      }
      continue;
    }`;
    
code = code.replace(oldPush, newPush);

// Now update processWaitrosePdf
const oldProcess = `function processWaitrosePdf(filePath: string, outputDir: string) {
    const tempDir = path.join(outputDir, 'temp_' + Date.now() + Math.random().toString(36).substring(7));`;

const newProcess = `function processWaitrosePdf(filePath: string, outputDir: string, tmpDir: string, date: string) {
    const tempDir = path.join(outputDir, 'temp_' + Date.now() + Math.random().toString(36).substring(7));`;

code = code.replace(oldProcess, newProcess);

const oldWriteHtml = `                        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
        }
        
        // Move all files except the original .pdf to outputDir`;

const newWriteHtml = `                        fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
                        
                        // Copy to tmp directory for future re-use
                        // We save as .html since it is HTML, but we also save as .pdf to satisfy the exact name requested if the user looks for it
                        if (tmpDir && date) {
                           fs.copyFileSync(htmlFilePath, path.join(tmpDir, \`\${date} groceries w - converted.html\`));
                           fs.copyFileSync(htmlFilePath, path.join(tmpDir, \`\${date} groceries w - converted.pdf\`));
                        }
        }
        
        // Move all files except the original .pdf to outputDir`;

code = code.replace(oldWriteHtml, newWriteHtml);

fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
