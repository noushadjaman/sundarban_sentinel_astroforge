import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');

const USER_AGENT = 'SundarbanSentinelDatasetBot/1.0 (contact: conservation@sentinel.org)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
        redirect: 'follow',
        ...options,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(` (retry ${attempt}/${retries} in ${delayMs}ms) `);
      await sleep(delayMs);
      delayMs *= 1.5;
    }
  }
}

async function downloadBinary(url, destPath) {
  const res = await fetchWithRetry(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 10000) {
    throw new Error(`File too small: ${buffer.length} bytes`);
  }
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// Fetch iNaturalist photos with resume capability
async function fetchINaturalistTaxon(taxonId, targetCount, outDir, prefix) {
  console.log(`\n========================================`);
  console.log(`Syncing ${targetCount} photos for taxon ${taxonId} (${prefix})...`);
  console.log(`========================================`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Count existing valid files
  const existingFiles = fs.readdirSync(outDir).filter(f => f.startsWith(prefix) && (f.endsWith('.jpg') || f.endsWith('.png')));
  let validExisting = 0;
  for (const f of existingFiles) {
    const s = fs.statSync(path.join(outDir, f));
    if (s.size > 10000) validExisting++;
  }

  console.log(`Found ${validExisting}/${targetCount} already existing valid files for ${prefix}.`);
  if (validExisting >= targetCount) {
    console.log(`Class ${prefix} is already fully satisfied!`);
    return existingFiles.slice(0, targetCount).map(f => ({
      file: f,
      sizeBytes: fs.statSync(path.join(outDir, f)).size,
      status: 'cached'
    }));
  }

  const url = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&per_page=60&order_by=votes`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  const results = data.results || [];

  const candidates = [];
  for (const obs of results) {
    if (obs.photos && obs.photos.length > 0) {
      for (const p of obs.photos) {
        if (p.url) {
          candidates.push({
            largeUrl: p.url.replace('/square.', '/large.'),
            mediumUrl: p.url.replace('/square.', '/medium.'),
            obsId: obs.id,
            species: obs.taxon?.name,
            commonName: obs.taxon?.preferred_common_name,
            place: obs.place_guess || 'South Asia',
          });
        }
      }
    }
  }

  console.log(`Found ${candidates.length} candidate photo URLs from iNaturalist for ${prefix}.`);

  let downloadedCount = validExisting;
  const metadataList = [];

  for (let i = 0; i < candidates.length && downloadedCount < targetCount; i++) {
    const item = candidates[i];
    const indexStr = String(downloadedCount + 1).padStart(2, '0');
    const fileName = `${prefix}_${indexStr}.jpg`;
    const destPath = path.join(outDir, fileName);

    // If file already exists and valid, skip
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
      continue;
    }

    process.stdout.write(`Downloading [${downloadedCount + 1}/${targetCount}] ${fileName}... `);
    try {
      let sizeBytes;
      try {
        sizeBytes = await downloadBinary(item.largeUrl, destPath);
      } catch (_) {
        sizeBytes = await downloadBinary(item.mediumUrl, destPath);
      }
      console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
      downloadedCount++;
      metadataList.push({
        file: fileName,
        species: item.species,
        commonName: item.commonName,
        location: item.place,
        sizeBytes,
        source: 'iNaturalist',
        obsId: item.obsId,
      });
      await sleep(250);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  return metadataList;
}

// Fetch Net Images from Wikimedia Commons with resume
async function fetchNetImages(targetCount, outDir, prefix) {
  console.log(`\n========================================`);
  console.log(`Syncing ${targetCount} photos for current_jal (gillnet / fishing nets in water)...`);
  console.log(`========================================`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(outDir).filter(f => f.startsWith(prefix));
  let validExisting = 0;
  for (const f of existingFiles) {
    const s = fs.statSync(path.join(outDir, f));
    if (s.size > 10000) validExisting++;
  }

  if (validExisting >= targetCount) {
    console.log(`Class ${prefix} is already fully satisfied!`);
    return existingFiles.slice(0, targetCount).map(f => ({
      file: f,
      sizeBytes: fs.statSync(path.join(outDir, f)).size,
      status: 'cached'
    }));
  }

  const queries = [
    'gillnet',
    'gill net fishing',
    'monofilament net',
    'fishing net water',
    'fishing net river',
    'illegal fishing net',
    'drift net fishing',
    'cast net river',
    'fish net water',
    'gillnetting'
  ];

  const candidateMap = new Map();

  for (const q of queries) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=30&prop=imageinfo&iiprop=url|size|mime&format=json`;
    try {
      const res = await fetchWithRetry(url);
      const data = await res.json();
      const pages = data.query?.pages ? Object.values(data.query.pages) : [];
      for (const p of pages) {
        const info = p.imageinfo?.[0];
        if (info?.url &&
            info.mime?.startsWith('image/') &&
            (info.url.endsWith('.jpg') || info.url.endsWith('.jpeg') || info.url.endsWith('.png')) &&
            !info.url.includes('.svg') &&
            !info.url.includes('.tif') &&
            info.size > 20000 &&
            info.size < 15000000) { // Limit huge 20MB files for faster training inference
          candidateMap.set(info.url, {
            title: p.title,
            url: info.url,
            size: info.size,
          });
        }
      }
    } catch (e) {
      console.error(`Wikimedia query ${q} error: ${e.message}`);
    }
  }

  console.log(`Found ${candidateMap.size} distinct candidate net images on Wikimedia Commons.`);

  const candidates = Array.from(candidateMap.values());
  let downloadedCount = validExisting;
  const metadataList = [];

  for (let i = 0; i < candidates.length && downloadedCount < targetCount; i++) {
    const item = candidates[i];
    const indexStr = String(downloadedCount + 1).padStart(2, '0');
    const ext = item.url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
    const fileName = `${prefix}_${indexStr}.${ext}`;
    const destPath = path.join(outDir, fileName);

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
      continue;
    }

    process.stdout.write(`Downloading [${downloadedCount + 1}/${targetCount}] ${fileName}... `);
    try {
      const sizeBytes = await downloadBinary(item.url, destPath);
      console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
      downloadedCount++;
      metadataList.push({
        file: fileName,
        title: item.title,
        sizeBytes,
        source: 'Wikimedia Commons',
        url: item.url,
      });
      await sleep(250);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  return metadataList;
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`Sundarban Wildlife & Poaching Dataset Extraction Pipeline`);
  console.log(`Target: 5 Classes x 20 Real Field Photos`);
  console.log(`Destination: ${DATASET_DIR}`);
  console.log(`======================================================\n`);

  const allManifest = {};

  // 1. Bengal Tiger (Panthera tigris, ID 41967) - 20 photos
  allManifest.bengal_tiger = await fetchINaturalistTaxon(
    41967,
    20,
    path.join(DATASET_DIR, 'bengal_tiger'),
    'bengal_tiger'
  );

  // 2. Chital Deer (Axis axis, ID 42166) - 20 photos
  allManifest.chital_deer = await fetchINaturalistTaxon(
    42166,
    20,
    path.join(DATASET_DIR, 'chital_deer'),
    'chital_deer'
  );

  // 3. Ganges Dolphin (Platanista gangetica, ID 41431) - 20 photos
  allManifest.ganges_dolphin = await fetchINaturalistTaxon(
    41431,
    20,
    path.join(DATASET_DIR, 'ganges_dolphin'),
    'ganges_dolphin'
  );

  // 4. Current Jal (Monofilament Gillnet / Poachers' Nets in Water) - 20 photos
  allManifest.current_jal = await fetchNetImages(
    20,
    path.join(DATASET_DIR, 'current_jal'),
    'current_jal'
  );

  // 5. Lesser Adjutant (Leptoptilos javanicus, ID 4749) - 20 photos
  allManifest.lesser_adjutant = await fetchINaturalistTaxon(
    4749,
    20,
    path.join(DATASET_DIR, 'lesser_adjutant'),
    'lesser_adjutant'
  );

  // Compile final manifest
  const summary = {};
  for (const [cls, list] of Object.entries(allManifest)) {
    const dir = path.join(DATASET_DIR, cls);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.startsWith(cls)) : [];
    summary[cls] = {
      target: 20,
      totalDownloaded: files.length,
      files,
    };
  }

  const manifestPath = path.join(DATASET_DIR, 'dataset_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2));

  console.log(`\n========================================`);
  console.log(`ALL 5 CLASSES COMPLETED SUCCESSFULLY!`);
  console.log(`Manifest saved to: ${manifestPath}`);
  console.log(`Summary:`);
  for (const [k, v] of Object.entries(summary)) {
    console.log(`  ✓ ${k}: ${v.totalDownloaded}/20 real wild photos`);
  }
  console.log(`========================================\n`);
}

main().catch(console.error);
