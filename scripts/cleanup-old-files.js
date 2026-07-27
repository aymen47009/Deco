import { readdirSync, unlinkSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

const keepComponents = new Set([
  'AdminDashboard.tsx',
  'GalleryManager.tsx',
  'LandingPage.tsx',
  'MaterialsManager.tsx',
  'ProjectsManager.tsx',
  'SiteSettings.tsx',
  'WorkersManager.tsx',
  'WorkerDashboard.tsx',
  'ui.tsx',
]);

const keepLib = new Set([
  'api.ts',
]);

function cleanDir(dirPath, keepSet, label) {
  const dir = join(root, dirPath);
  if (!existsSync(dir)) return;
  const files = readdirSync(dir);
  let removed = 0;
  for (const file of files) {
    if (file.startsWith('.')) continue;
    if (!keepSet.has(file)) {
      const full = join(dir, file);
      try {
        unlinkSync(full);
        console.log(`Removed old ${label}: ${file}`);
        removed++;
      } catch (e) {
        try { rmSync(full, { recursive: true, force: true }); console.log(`Removed old ${label}: ${file}`); removed++; }
        catch { console.warn(`Could not remove ${dirPath}/${file}: ${e.message}`); }
      }
    }
  }
  return removed;
}

const c1 = cleanDir('src/components', keepComponents, 'component') || 0;
const c2 = cleanDir('src/lib', keepLib, 'lib') || 0;
const total = c1 + c2;

if (total === 0) {
  console.log('Cleanup: no old files found.');
} else {
  console.log(`Cleanup complete: ${total} old file(s) removed.`);
}
