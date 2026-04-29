import { copyFile, mkdir, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// cdn/styles/ is produced directly by vite.config.cdn-css.ts (Tailwind v4
// resolves @theme into :root declarations there). The CEM manifest is the
// only asset we still mirror by hand.
const tasks = [{ from: 'dist/custom-elements.json', to: 'cdn/custom-elements.json' }];

const results = await Promise.all(
  tasks.map(async ({ from, to }) => {
    if (!(await exists(from))) {
      console.warn(`Skip: ${from} does not exist (run the dist build first)`);
      return false;
    }
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
    console.log(`Copied ${from} → ${to}`);
    return true;
  }),
);

const copied = results.filter(Boolean).length;
console.log(`Mirrored ${copied} CDN asset(s) under cdn/`);
