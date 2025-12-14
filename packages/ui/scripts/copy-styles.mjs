import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { globSync } from 'tinyglobby';

const files = globSync('src/html/**/*.css');

await Promise.all(
  files.map(async (file) => {
    const dest = join('dist', relative('src/html', file));
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(file, dest);
  }),
);

console.log(`Copied ${files.length} CSS file(s) into dist/`);
