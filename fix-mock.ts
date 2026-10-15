import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
async function run() {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    page.drawText('Mock PDF content (Flat 279, 3JP)');
    fs.writeFileSync('../../food-data/20231024 groceries.pdf', await doc.save());
}
run();
