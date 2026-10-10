// Writes 1200x630 PNG Open Graph images (stored as base64 text in scripts/og/) to build/projects/og/.
// No dependencies. Never fails the build.
const fs = require('node:fs');
const path = require('node:path');

const srcDir = path.resolve(__dirname, 'og');
const outDir = path.resolve(__dirname, '..', 'build', 'projects', 'og');

try {
  fs.mkdirSync(outDir, { recursive: true });
  let count = 0;
  fs.readdirSync(srcDir).filter((file) => file.endsWith('.b64')).forEach((file) => {
    const data = Buffer.from(fs.readFileSync(path.join(srcDir, file), 'utf8').trim(), 'base64');
    fs.writeFileSync(path.join(outDir, file.replace(/\.b64$/, '.png')), data);
    count += 1;
  });
  console.log(`Wrote ${count} og images to build/projects/og`);
} catch (error) {
  console.warn(`og images skipped: ${error.message}`);
}
