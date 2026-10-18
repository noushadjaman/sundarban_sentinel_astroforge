import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const NET_DIR = path.join(ROOT_DIR, 'dataset', 'current_jal');

const USER_AGENT = 'SundarbanSentinelDatasetBot/1.0 (biodiversity@sentinel.org)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 15000) throw new Error(`File too small: ${buffer.length}`);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`Syncing 20 Real Current Jal (Monofilament Gillnet / Poaching Nets) Photos`);
  console.log(`Destination: ${NET_DIR}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(NET_DIR)) {
    fs.mkdirSync(NET_DIR, { recursive: true });
  }

  // Rename current_jal_08.jpg to current_jal_07.jpg if 07 is missing
  const p7 = path.join(NET_DIR, 'current_jal_07.jpg');
  const p8 = path.join(NET_DIR, 'current_jal_08.jpg');
  if (!fs.existsSync(p7) && fs.existsSync(p8)) {
    fs.renameSync(p8, p7);
  }

  // Query iNaturalist for gillnets and fishing nets in water
  const queries = ['gillnet', 'fishing net water', 'cast net', 'ghost net river'];
  const candidates = [];

  for (const q of queries) {
    const url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(q)}&photos=true&per_page=30&order_by=votes`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      const data = await res.json();
      for (const obs of (data.results || [])) {
        if (obs.photos && obs.photos.length > 0) {
          for (const p of obs.photos) {
            candidates.push({
              url: p.url.replace('/square.', '/large.'),
              fallbackUrl: p.url.replace('/square.', '/medium.'),
              description: `${q} - ${obs.place_guess || 'river/water'}`,
              obsId: obs.id
            });
          }
        }
      }
    } catch (e) {
      console.error(`Query ${q} error: ${e.message}`);
    }
  }

  console.log(`Found ${candidates.length} candidate net photos on iNaturalist.`);

  for (let num = 1; num <= 20; num++) {
    const indexStr = String(num).padStart(2, '0');
    const fileName = `current_jal_${indexStr}.jpg`;
    const destPath = path.join(NET_DIR, fileName);

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 20000) {
      console.log(`[${num}/20] ${fileName} already exists (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
      continue;
    }

    let success = false;
    for (let cIdx = 0; cIdx < candidates.length && !success; cIdx++) {
      const item = candidates[cIdx];
      process.stdout.write(`[${num}/20] Downloading ${fileName} (${item.description.substring(0, 35)})... `);
      try {
        let sizeBytes;
        try {
          sizeBytes = await downloadFile(item.url, destPath);
        } catch (_) {
          sizeBytes = await downloadFile(item.fallbackUrl, destPath);
        }
        console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
        candidates.splice(cIdx, 1);
        success = true;
        await sleep(200);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
    }
  }

  const finalFiles = fs.readdirSync(NET_DIR).filter(f => f.startsWith('current_jal_'));
  console.log(`\nCompleted: ${finalFiles.length}/20 Current Jal photos saved to ${NET_DIR}!\n`);
}

run().catch(console.error);
