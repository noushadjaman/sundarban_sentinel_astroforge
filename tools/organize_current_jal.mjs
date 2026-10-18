import fs from 'node:fs';
import path from 'node:path';

const dir = 'F:/sundarbansanetile/dataset/current_jal';

// 1. Remove 16.jpg and 17.jpg if they exist
const extra16 = path.join(dir, 'current_jal_16.jpg');
const extra17 = path.join(dir, 'current_jal_17.jpg');
if (fs.existsSync(extra16)) fs.unlinkSync(extra16);
if (fs.existsSync(extra17)) fs.unlinkSync(extra17);

// 2. Renumber existing 10..15 to 15..20 via temp names to avoid collisions
for (let i = 15; i >= 10; i--) {
  const oldPath = path.join(dir, `current_jal_${i}.jpg`);
  const newNum = i + 5;
  const tempPath = path.join(dir, `temp_jal_${newNum}.jpg`);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, tempPath);
  }
}

for (let i = 15; i <= 20; i++) {
  const tempPath = path.join(dir, `temp_jal_${i}.jpg`);
  const finalPath = path.join(dir, `current_jal_${i}.jpg`);
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, finalPath);
  }
}

// 3. Rename the 5 screenshots to current_jal_10 through current_jal_14
const screenshots = [
  { from: 'Screenshot 2026-09-28 065934.png', to: 'current_jal_10.png' },
  { from: 'Screenshot 2026-09-28 070011.png', to: 'current_jal_11.png' },
  { from: 'Screenshot 2026-09-28 070022.png', to: 'current_jal_12.png' },
  { from: 'Screenshot 2026-09-28 070049.png', to: 'current_jal_13.png' },
  { from: 'Screenshot 2026-09-28 070104.png', to: 'current_jal_14.png' }
];

for (const s of screenshots) {
  const src = path.join(dir, s.from);
  const dst = path.join(dir, s.to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log(`Renamed: ${s.from} -> ${s.to}`);
  } else {
    console.log(`Warning: ${s.from} not found`);
  }
}

const files = fs.readdirSync(dir).sort();
console.log(`\nFinal ${files.length} files in current_jal:`);
files.forEach((f, idx) => console.log(`  [${idx+1}] ${f}`));
