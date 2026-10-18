import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');

const USER_AGENT = 'SundarbanSentinelDatasetBot/2.0 (contact: biodiversity@sentinel.org)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
      redirect: 'follow',
      signal: controller.signal,
      ...options,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function downloadBinary(url, destPath) {
  const res = await fetchWithTimeout(url, {}, 8000);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 12000) {
    throw new Error(`File too small: ${buffer.length} bytes`);
  }
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// Extract candidate photos from iNaturalist
async function getINaturalistPhotos(queryUrl) {
  try {
    const res = await fetchWithTimeout(queryUrl, {}, 10000);
    const data = await res.json();
    const list = [];
    for (const obs of (data.results || [])) {
      if (obs.photos && obs.photos.length > 0) {
        for (const p of obs.photos) {
          if (p.url) {
            list.push({
              largeUrl: p.url.replace('/square.', '/large.'),
              mediumUrl: p.url.replace('/square.', '/medium.'),
              place: obs.place_guess || 'South Asia',
              obsId: obs.id,
              species: obs.taxon?.name
            });
          }
        }
      }
    }
    return list;
  } catch (err) {
    console.error(`Error querying ${queryUrl}:`, err.message);
    return [];
  }
}

// Download close shots to reach target count of 30
async function extendCategory(categoryName, queryUrls, startNum, targetTotal) {
  const outDir = path.join(DATASET_DIR, categoryName);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`\n======================================================`);
  console.log(`Extending ${categoryName}: ${startNum} -> ${targetTotal} (Close Shots)`);
  console.log(`======================================================`);

  let allCandidates = [];
  for (const q of queryUrls) {
    const photos = await getINaturalistPhotos(q);
    allCandidates.push(...photos);
    await sleep(150);
  }

  console.log(`Found ${allCandidates.length} candidate close shots for ${categoryName}`);

  for (let num = startNum; num <= targetTotal; num++) {
    const indexStr = String(num).padStart(2, '0');
    const jpgPath = path.join(outDir, `${categoryName}_${indexStr}.jpg`);
    const pngPath = path.join(outDir, `${categoryName}_${indexStr}.png`);

    if ((fs.existsSync(jpgPath) && fs.statSync(jpgPath).size > 12000) ||
        (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 12000)) {
      console.log(`[${num}/${targetTotal}] ${categoryName}_${indexStr} already exists. Skipping.`);
      continue;
    }

    let success = false;
    for (let cIdx = 0; cIdx < allCandidates.length && !success; cIdx++) {
      const item = allCandidates[cIdx];
      process.stdout.write(`[${num}/${targetTotal}] Downloading ${categoryName}_${indexStr}.jpg (${item.place.substring(0, 30)})... `);
      try {
        let sizeBytes;
        try {
          sizeBytes = await downloadBinary(item.largeUrl, jpgPath);
        } catch (_) {
          sizeBytes = await downloadBinary(item.mediumUrl, jpgPath);
        }
        console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
        allCandidates.splice(cIdx, 1);
        success = true;
        await sleep(150);
      } catch (err) {
        console.log(`FAILED (${err.message}). Trying next candidate...`);
      }
    }
  }
}

// Special handler for current_jal (ensures slots 1..30 are filled, preserving user screenshots at 10..14)
async function extendCurrentJal(targetTotal) {
  const outDir = path.join(DATASET_DIR, 'current_jal');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Syncing current_jal to full ${targetTotal} Close Shots`);
  console.log(`======================================================`);

  const queryUrls = [
    'https://api.inaturalist.org/v1/observations?q=gillnet&photos=true&per_page=30&order_by=votes',
    'https://api.inaturalist.org/v1/observations?q=monofilament%20net&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=fishing%20net%20water&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=ghost%20net&photos=true&per_page=30',
  ];

  let allCandidates = [];
  for (const q of queryUrls) {
    const photos = await getINaturalistPhotos(q);
    allCandidates.push(...photos);
    await sleep(150);
  }

  for (let num = 1; num <= targetTotal; num++) {
    const indexStr = String(num).padStart(2, '0');
    const jpgPath = path.join(outDir, `current_jal_${indexStr}.jpg`);
    const pngPath = path.join(outDir, `current_jal_${indexStr}.png`);

    if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 12000) {
      console.log(`[${num}/${targetTotal}] current_jal_${indexStr}.png (user screenshot) preserved.`);
      continue;
    }
    if (fs.existsSync(jpgPath) && fs.statSync(jpgPath).size > 12000) {
      console.log(`[${num}/${targetTotal}] current_jal_${indexStr}.jpg exists.`);
      continue;
    }

    let success = false;
    for (let cIdx = 0; cIdx < allCandidates.length && !success; cIdx++) {
      const item = allCandidates[cIdx];
      process.stdout.write(`[${num}/${targetTotal}] Downloading current_jal_${indexStr}.jpg (${item.place.substring(0, 30)})... `);
      try {
        let sizeBytes;
        try {
          sizeBytes = await downloadBinary(item.largeUrl, jpgPath);
        } catch (_) {
          sizeBytes = await downloadBinary(item.mediumUrl, jpgPath);
        }
        console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
        allCandidates.splice(cIdx, 1);
        success = true;
        await sleep(150);
      } catch (err) {
        console.log(`FAILED (${err.message}). Trying next candidate...`);
      }
    }
  }
}

async function main() {
  console.log(`Sundarban Sentinel Extended Dataset Pipeline`);
  console.log(`Goal: 30 Images per Class (150 Total Images)\n`);

  // 1. Bengal Tiger: 21 to 30 (Close shots of face, head, eyes, paws)
  await extendCategory(
    'bengal_tiger',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=2&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=3&per_page=30'
    ],
    21,
    30
  );

  // 2. Chital Deer: 21 to 30 (Close shots of Sundarban spotted deer, head, spots, antlers)
  await extendCategory(
    'chital_deer',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&page=2&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&page=1&per_page=30'
    ],
    21,
    30
  );

  // 3. Ganges Dolphin: 21 to 30 (Close shots of rostrum, blowhole, surfacing)
  await extendCategory(
    'ganges_dolphin',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=2&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=3&per_page=30'
    ],
    21,
    30
  );

  // 4. Lesser Adjutant: 21 to 30 (Close shots of head, massive bill, pouch, eye)
  await extendCategory(
    'lesser_adjutant',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=2&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=3&per_page=30'
    ],
    21,
    30
  );

  // 5. Current Jal: Ensure all 1..30 are filled
  await extendCurrentJal(30);

  console.log(`\n======================================================`);
  console.log(`DATASET EXTENSION TO 30 IMAGES PER SECTION COMPLETE!`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
