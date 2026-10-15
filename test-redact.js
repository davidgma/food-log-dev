import fs from 'fs';
import { PDFDocument, PDFRawStream, PDFName, decodePDFRawStream, PDFString, PDFHexString } from 'pdf-lib';

async function run() {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  page.drawText('This is a test document for Flat 279, Some Street, 3JP.');
  const pdfBytes = await doc.save();
  fs.writeFileSync('test.pdf', pdfBytes);

  const loadedDoc = await PDFDocument.load(fs.readFileSync('test.pdf'));
  const context = loadedDoc.context;
  const indirectObjects = context.enumerateIndirectObjects();
  
  let modified = false;
  for (const [ref, obj] of indirectObjects) {
    if (obj instanceof PDFRawStream) {
      try {
        const decoded = decodePDFRawStream(obj).decode();
        let streamStr = Buffer.from(decoded).toString('binary');
        if (streamStr.includes('Flat 279')) {
          console.log('Found in stream!');
          // Replace it
          streamStr = streamStr.replace(/Flat 279.*?3JP/gis, (match) => '*'.repeat(match.length));
          
          // Re-encode
          const newStream = context.flateStream(Buffer.from(streamStr, 'binary'));
          context.assign(ref, newStream);
          modified = true;
        }
      } catch (e) {
        // Not a stream we can easily decode
      }
    }
  }

  if (modified) {
    const outBytes = await loadedDoc.save();
    fs.writeFileSync('test_out.pdf', outBytes);
    console.log('Modified PDF saved.');
  }
}
run();
