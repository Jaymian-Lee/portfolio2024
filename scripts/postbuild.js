const { spawnSync } = require('node:child_process');

if (process.env.VERCEL || process.env.CI) {
  console.log('Skipping react-snap during CI/Vercel build.');
  process.exit(0);
}

const result = spawnSync('npx', ['react-snap'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

process.exit(result.status ?? 1);

