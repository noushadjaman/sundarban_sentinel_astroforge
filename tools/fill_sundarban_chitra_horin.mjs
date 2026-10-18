import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CHITAL_DIR = path.join(ROOT_DIR, 'dataset', 'chital_deer');

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
  console.log(`Extracting 20 Close-Up Photos of Sundarban Deer (Chitra Horin)`);
  console.log(`Querying: iNaturalist Sundarbans Mangrove Reserve observations (taxon 42166)`);
  console.log(`Destination: ${CHITAL_DIR}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(CHITAL_DIR)) {
    fs.mkdirSync(CHITAL_DIR, { recursive: true });
  }

  // Fetch observations specifically from Sundarbans
  const url = 'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&per_page=45&order_by=votes';
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const data = await res.json();
  const results = data.results || [];

  const candidates = [];
  for (const obs of results) {
    if (obs.photos && obs.photos.length > 0) {
      for (const p of obs.photos) {
        if (p.url) {
          candidates.push({
            url: p.url.replace('/square.', '/large.'),
            fallbackUrl: p.url.replace('/square.', '/medium.'),
            place: obs.place_guess || 'Sundarbans, Bangladesh/India',
            obsId: obs.id
          });
        }
      }
    }
  }

  console.log(`Found ${candidates.length} candidated photos taken in the Sundarbans.`);

  let count = 0;
  for (let i = 0; i < candidates.length && count < 20; i++) {
    const item = candidates[i];
    const indexStr = String(count + 1).padStart(2, '0');
    const fileName = `chital_deer_${indexStr}.jpg`;
    const destPath = path.join(CHITAL_DIR, fileName);

    process.stdout.write(`[${count + 1}/20] Downloading ${fileName} (${item.place.substring(0, 40)})... `);
    try {
      let sizeBytes;
      try {
        sizeBytes = await downloadFile(item.url, destPath);
      } catch (_) {
        sizeBytes = await downloadFile(item.fallbackUrl, destPath);
      }
      console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
      count++;
      await sleep(200);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\nCompleted: ${count}/20 close-up Sundarban Chitra Horin photos saved to ${CHITAL_DIR}!\n`);
}

run().catch(console.error);
