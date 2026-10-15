const fs = require('fs');
let code = fs.readFileSync('build.ts', 'utf-8');

const mockPdfO = "fs.writeFileSync(path.join(inputDir, '20231024 groceries o.pdf'), await docO.save());";
const mockPngF = "    const emptyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');\n    fs.writeFileSync(path.join(inputDir, '20231024 groceries f.png'), emptyPng);";

code = code.replace(mockPdfO, mockPdfO + "\\n" + mockPngF);
fs.writeFileSync('build.ts', code, 'utf-8');
