import { copyFile, cp, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { globSync } from 'tinyglobby';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// The CDN modules mirror `dist/`'s layout (src/html/** → **), so the type
// declarations `tsc` emits there describe them as-is.
const declarations = globSync('**/*.d.ts{,.map}', { cwd: 'dist' }).map((file) => ({
  from: join('dist', file),
  to: join('cdn', file),
  kind: 'file',
  quiet: true,
}));

const tasks = [
  { from: 'dist/css', to: 'cdn/styles', kind: 'dir' },
  { from: 'dist/custom-elements.json', to: 'cdn/custom-elements.json', kind: 'file' },
  ...declarations,
];

const results = await Promise.all(
  tasks.map(async ({ from, to, kind, quiet }) => {
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
    if (!quiet) console.log(`Copied ${from} → ${to}`);
    return true;
  }),
);

const copied = results.filter(Boolean).length;
console.log(
  `Mirrored ${copied} CDN asset(s) under cdn/ (${declarations.length} type declaration files)`,
);
