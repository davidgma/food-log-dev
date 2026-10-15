import fs from 'fs';
import { PDFDocument, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
async function run() {
    const dataBuffer = fs.readFileSync('../../food-data/20231024 groceries.pdf');
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const context = pdfDoc.context;
    const indirectObjects = context.enumerateIndirectObjects();
    for (const [ref, obj] of indirectObjects) {
        if (obj instanceof PDFRawStream) {
            try {
                const decoded = decodePDFRawStream(obj).decode();
                let streamStr = Buffer.from(decoded).toString('binary');
                console.log(streamStr);
            } catch (e) {}
        }
    }
}
run();
