import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// paths to your font files
const ttfPath = resolve(__dirname, './src/pdf/fonts/HindSiliguri-Regular.ttf');
const outPath = resolve(__dirname, './src/pdf/fonts/HindSiliguri-Regular.js');

// read as base64 and emit an ES module that exports the string
const base64 = readFileSync(ttfPath, { encoding: 'base64' });
const js     = `export default "${base64}";\n`;
writeFileSync(outPath, js);

