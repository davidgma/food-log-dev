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
        
        // Simple plain match
        if (streamStr.includes('Flat 279')) {
          streamStr = streamStr.replace(/Flat 279.*?3JP/gis, (m) => '*'.repeat(m.length));
          const newStream = context.flateStream(Buffer.from(streamStr, 'binary'));
          context.assign(ref, newStream);
          modified = true;
          continue;
        }

        // Hex match
        // "Flat 279" -> 466c617420323739
        // Convert streamStr hex tags <...> to see if it matches?
        let hexModified = false;
        streamStr = streamStr.replace(/<([0-9A-Fa-f]+)>/g, (match, hex) => {
            const ascii = Buffer.from(hex, 'hex').toString('binary');
            if (/Flat 279.*?3JP/is.test(ascii)) {
                hexModified = true;
                const redactedAscii = ascii.replace(/Flat 279.*?3JP/gis, m => '*'.repeat(m.length));
                return '<' + Buffer.from(redactedAscii, 'binary').toString('hex') + '>';
            }
            // Check if parts match? If it's just "Flat 279" it's harder, but let's assume the whole block is in one hex string.
            return match;
        });

        if (hexModified) {
            const newStream = context.flateStream(Buffer.from(streamStr, 'binary'));
            context.assign(ref, newStream);
            modified = true;
        }
      } catch (e) {
      }
    }
  }
  
  if (modified) {
     console.log("Modified successfully!");
  } else {
     console.log("Not found in stream.");
  }
}
run();
