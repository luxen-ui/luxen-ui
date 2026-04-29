import { copyFile, cp, mkdir, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const tasks = [
  { from: 'dist/css', to: 'cdn/styles', kind: 'dir' },
  { from: 'dist/custom-elements.json', to: 'cdn/custom-elements.json', kind: 'file' },
];

const results = await Promise.all(
  tasks.map(async ({ from, to, kind }) => {
    if (!(await exists(from))) {
      console.warn(`Skip: ${from} does not exist (run the dist build first)`);
      return false;
    }
    await mkdir(dirname(to), { recursive: true });
    if (kind === 'dir') {
      await cp(from, to, { recursive: true });
    } else {
      await copyFile(from, to);
    }
    console.log(`Copied ${from} → ${to}`);
    return true;
  }),
);

const copied = results.filter(Boolean).length;
console.log(`Mirrored ${copied} CDN asset(s) under cdn/`);
