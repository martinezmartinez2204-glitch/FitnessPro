import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const webFiles = ['index.html', 'styles.css', 'utils.js', 'storage.js', 'app.js'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of webFiles) {
    await cp(path.join(root, file), path.join(output, file));
}
