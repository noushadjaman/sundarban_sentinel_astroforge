import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');

function queryCandidates(queryUrl) {
  try {
    const raw = execFileSync('curl.exe', [
      '-s', '--compressed', '-L',
      '--retry', '3',
      '--retry-delay', '2',
      '--max-time', '40',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      queryUrl
    ], { encoding: 'utf-8', maxBuffer: 15 * 1024 * 1024 });

    const data = JSON.parse(raw);
    const photos = [];
    for (const obs of (data.results || [])) {
      if (obs.photos && obs.photos.length > 0) {
        for (const p of obs.photos) {
          if (p.url) {
            photos.push({
              medium: p.url.replace('/square.', '/medium.'),
              large: p.url.replace('/square.', '/large.'),
              place: obs.place_guess || 'Wild Observation',
              id: obs.id
            });
          }
        }
      }
    }
    return photos;
  } catch (err) {
    console.error(`Query failed: ${queryUrl.substring(0, 70)}... (${err.message})`);
    return [];
  }
}

function downloadImage(url, dest) {
  try {
    execFileSync('curl.exe', [
      '-s', '-L',
      '--retry', '3',
      '--retry-delay', '1',
      '--max-time', '20',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      '-o', dest,
      url
    ]);
    if (!fs.existsSync(dest)) return 0;
    const sz = fs.statSync(dest).size;
    if (sz < 15000) {
      try { fs.unlinkSync(dest); } catch (_) {}
      return 0;
    }
    return sz;
  } catch (e) {
    try { if (fs.existsSync(dest)) fs.unlinkSync(dest); } catch (_) {}
    return 0;
  }
}

async function fillSlots(category, queryUrls, startNum, targetTotal) {
  const dir = path.join(DATASET_DIR, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Processing: ${category} (Slots ${startNum} to ${targetTotal})`);
  console.log(`======================================================`);

  let candidates = [];
  for (const q of queryUrls) {
    process.stdout.write(`Fetching queries: ${q.substring(0, 80)}... `);
    const list = queryCandidates(q);
    console.log(`found ${list.length} photos`);
    candidates.push(...list);
  }

  console.log(`Total candidate pool for ${category}: ${candidates.length} photos`);

  for (let num = startNum; num <= targetTotal; num++) {
    const idx = String(num).padStart(2, '0');
    const jpg = path.join(dir, `${category}_${idx}.jpg`);
    const png = path.join(dir, `${category}_${idx}.png`);

    if (fs.existsSync(png) && fs.statSync(png).size > 15000) {
      console.log(`[${num}/${targetTotal}] ${category}_${idx}.png exists. Skipping.`);
      continue;
    }
    if (fs.existsSync(jpg) && fs.statSync(jpg).size > 15000) {
      console.log(`[${num}/${targetTotal}] ${category}_${idx}.jpg exists. Skipping.`);
      continue;
    }

    let ok = false;
    while (candidates.length > 0 && !ok) {
      const c = candidates.shift();
      process.stdout.write(`[${num}/${targetTotal}] Downloading ${category}_${idx}.jpg (${c.place.substring(0, 25)})... `);
      let bytes = downloadImage(c.medium, jpg);
      if (!bytes) {
        bytes = downloadImage(c.large, jpg);
      }
      if (bytes > 0) {
        console.log(`SUCCESS (${(bytes / 1024).toFixed(1)} KB)`);
        ok = true;
      } else {
        console.log(`Failed. Trying next candidate...`);
      }
    }

    if (!ok) {
      console.warn(`[!] No candidates left for ${category}_${idx}`);
    }
  }
}

async function main() {
  console.log(`Running Sundarban Sentinel Close-Shot Extractor`);

  // 1. Bengal Tiger: 27 to 30
  await fillSlots('bengal_tiger', [
    'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=4&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=5&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&order_by=votes&page=1&per_page=15'
  ], 27, 30);

  // 2. Chital Deer (Chitra Horin): 21 to 30
  await fillSlots('chital_deer', [
    'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&page=1&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=42166&photos=true&quality_grade=research&order_by=votes&page=1&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=42166&photos=true&quality_grade=research&order_by=votes&page=2&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=42166&photos=true&quality_grade=research&page=2&per_page=15'
  ], 21, 30);

  // 3. Ganges Dolphin: 21 to 30
  await fillSlots('ganges_dolphin', [
    'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=1&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=2&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&order_by=votes&page=1&per_page=15'
  ], 21, 30);

  // 4. Lesser Adjutant: 21 to 30
  await fillSlots('lesser_adjutant', [
    'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=1&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=2&per_page=15',
    'https://api.inaturalist.org/v1/observations?taxon_id=4749&photos=true&order_by=votes&page=1&per_page=15'
  ], 21, 30);

  // 5. Current Jal: 18 to 30
  await fillSlots('current_jal', [
    'https://api.inaturalist.org/v1/observations?q=gillnet&photos=true&per_page=15&order_by=votes',
    'https://api.inaturalist.org/v1/observations?q=fishing%20net%20water&photos=true&per_page=15',
    'https://api.inaturalist.org/v1/observations?q=monofilament%20net&photos=true&per_page=15',
    'https://api.inaturalist.org/v1/observations?q=ghost%20net&photos=true&per_page=15',
    'https://api.inaturalist.org/v1/observations?q=poaching%20net&photos=true&per_page=15',
    'https://api.inaturalist.org/v1/observations?q=nylon%20fishing%20net&photos=true&per_page=15'
  ], 18, 30);

  console.log(`\n======================================================`);
  console.log(`ALL 5 CATEGORIES PROCESSED!`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
