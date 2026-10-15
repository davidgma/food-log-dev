import { generateSite } from './src/lib/generator.js';
import path from 'path';
import fs from 'fs';

async function main() {
  const configPath = path.resolve(process.cwd(), 'config.json');
  
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ inputDir: "../../food-data" }, null, 2));
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);
  const inputDir = path.resolve(path.dirname(configPath), config.inputDir);
  
  // Auto-create mock directory if it doesn't exist so build doesn't crash on first run
  if (!fs.existsSync(inputDir)) {
    console.log(`Creating mock input directory at ${inputDir}`);
    fs.mkdirSync(inputDir, { recursive: true });
    fs.writeFileSync(path.join(inputDir, 'overview.md'), '# Mock OverviewThis is auto-generated mock data.');
    fs.writeFileSync(path.join(inputDir, '20231024 summary.txt'), 'Mock summary content.');
    
    // Create valid mock PDFs to test parser
    const { PDFDocument } = await import('pdf-lib');
    const docW = await PDFDocument.create();
    const pageW = docW.addPage();
    pageW.drawText('Mock PDF content (Flat 279, 3JP, SO14)');
    fs.writeFileSync(path.join(inputDir, '20231024 groceries w.pdf'), await docW.save());

    const docO = await PDFDocument.create();
    const pageO = docO.addPage();
    pageO.drawText('Mock PDF content Ocado');
    fs.writeFileSync(path.join(inputDir, '20231024 groceries o.pdf'), await docO.save());    const emptyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(path.join(inputDir, '20231024 groceries f.png'), emptyPng);
  }

  console.log(`Building site from ${inputDir}...`);
  try {
    await generateSite(configPath);
    console.log('Site generated successfully in food-log/docs/index.html');
  } catch (e) {
    console.error('Error generating site:', e);
    process.exit(1);
  }
}

main();
