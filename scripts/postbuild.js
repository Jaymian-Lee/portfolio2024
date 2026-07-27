const { spawnSync } = require('node:child_process');

if (process.env.VERCEL || process.env.CI) {
  console.log('Skipping react-snap during CI/Vercel build; writing route metadata fallbacks.');
  const result = spawnSync(process.execPath, ['scripts/generate-static-route-meta.js'], {
    stdio: 'inherit',
    env: process.env
  });
  process.exit(result.status ?? 1);
}

const result = spawnSync('npx', ['react-snap'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

process.exit(result.status ?? 1);
