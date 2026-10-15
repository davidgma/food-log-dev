import fs from 'fs';
import { PDFDocument, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

async function run() {
  const loadedDoc = await PDFDocument.load(fs.readFileSync('test.pdf'));
  const context = loadedDoc.context;
  const indirectObjects = context.enumerateIndirectObjects();
  
  let modified = false;
  for (const [ref, obj] of indirectObjects) {
    if (obj instanceof PDFRawStream) {
      try {
        const decoded = decodePDFRawStream(obj).decode();
        let streamStr = Buffer.from(decoded).toString('binary');
        
        // Let's decode any hex strings <...> to ascii just to check? No, replacing in hex is better.
        // Let's just convert streamStr to a hex string and back?
        // Actually, just find and replace in the stream
        
      } catch (e) {
      }
    }
  }
}
run();
