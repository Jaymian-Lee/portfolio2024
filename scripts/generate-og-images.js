// Builds 1200x630 PNG Open Graph images for each project case into build/projects/og/.
// Runs after `react-scripts build` (see scripts/postbuild.js). Never fails the build:
// if sharp is missing or an image fails, the route generator falls back to the original image.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'build', 'projects', 'og');
const W = 1200;
const H = 630;

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.warn('og images skipped: sharp not available');
    return;
  }

  const source = fs.readFileSync(path.join(root, 'src', 'data', 'projectCases.js'), 'utf8');
  const cases = JSON.parse(source.slice(source.indexOf('['), source.indexOf('];') + 1));
  fs.mkdirSync(outDir, { recursive: true });

  for (const project of cases) {
    try {
      const input = path.join(root, 'public', project.image.replace(/^\//, ''));
      const resized = await sharp(input, { density: 144 })
        .resize({ width: W - 80, height: H - 80, fit: 'inside' })
        .png()
        .toBuffer();
      await sharp({ create: { width: W, height: H, channels: 3, background: { r: 24, g: 20, b: 16 } } })
        .composite([{ input: resized, gravity: 'centre' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, `${project.slug}.png`));
    } catch (error) {
      console.warn(`og image skipped for ${project.slug}: ${error.message}`);
    }
  }
  console.log(`Wrote og images to ${path.relative(root, outDir)}`);
}

main().catch((error) => console.warn(`og images skipped: ${error.message}`));
