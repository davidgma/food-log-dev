import fs from 'fs';
import { PDFDocument, PDFRawStream, PDFName, decodePDFRawStream, PDFString, PDFHexString } from 'pdf-lib';

async function run() {
  const loadedDoc = await PDFDocument.load(fs.readFileSync('test.pdf'));
  const context = loadedDoc.context;
  const indirectObjects = context.enumerateIndirectObjects();
  
  for (const [ref, obj] of indirectObjects) {
    if (obj instanceof PDFRawStream) {
      try {
        const decoded = decodePDFRawStream(obj).decode();
        let streamStr = Buffer.from(decoded).toString('binary');
        console.log("Stream:", streamStr);
      } catch (e) {
      }
    }
  }
}
run();
