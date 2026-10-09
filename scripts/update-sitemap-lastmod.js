// Sets <lastmod> in public/sitemap.xml from git history of the files behind each page.
// Run manually after content changes: npm run sitemap  (needs full git history, so not part of the Vercel build).
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const sitemapPath = path.join(root, 'public', 'sitemap.xml');
const casesFile = 'src/data/projectCases.js';

const git = (args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
};
const lastCommitDate = (files) => files
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => git(['log', '-1', '--format=%cs', '--', file]))
  .filter(Boolean)
  .sort()
  .pop();

const caseLines = fs.readFileSync(path.join(root, casesFile), 'utf8').split('\n');
const slugLines = caseLines
  .map((line, index) => ({ index, match: line.match(/^\s*"slug": "([^"]+)"/) }))
  .filter((item) => item.match);

const projectDate = (slug) => {
  const at = slugLines.findIndex((item) => item.match[1] === slug);
  if (at === -1) return null;
  const start = slugLines[at].index;
  const end = at + 1 < slugLines.length ? slugLines[at + 1].index - 1 : caseLines.length - 2;
  const blockDate = git(['log', '-1', '--format=%cs', `-L${start + 1},${end + 1}:${casesFile}`]).split('\n')[0];
  return blockDate || null;
};

const pageFiles = {
  '/': ['src/App.js'],
  '/lab': ['src/pages/LabPage.js'],
  '/word-lee': ['src/pages/DailyWordPage.js'],
  '/toepen': ['src/pages/ToepenPage.js'],
  '/pesten': ['src/pages/PestenPage.js'],
  '/sp500-calculator': ['src/pages/SP500CalculatorPage.js'],
  '/stream': ['src/pages/StreamDashboardPage.js'],
  '/stream/chat': ['src/pages/StreamChatPage.js']
};

const dateFor = (pagePath) => {
  if (pagePath.startsWith('/projects/')) return projectDate(pagePath.split('/').pop());
  return lastCommitDate(pageFiles[pagePath] || []);
};

let xml = fs.readFileSync(sitemapPath, 'utf8');
xml = xml.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]*<\/lastmod>/g, (whole, loc) => {
  const pagePath = loc.replace('https://www.jaymian-lee.nl', '').replace(/^\/nl(?=\/|$)/, '') || '/';
  const date = dateFor(pagePath);
  return date ? `<url><loc>${loc}</loc><lastmod>${date}</lastmod>` : whole;
});
fs.writeFileSync(sitemapPath, xml);
console.log('sitemap lastmod updated');
