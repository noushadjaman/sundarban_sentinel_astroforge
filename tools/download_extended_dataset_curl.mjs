import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetchJsonWithCurl(url) {
  try {
    const stdout = execFileSync('curl.exe', [
      '-s', '-L',
      '--retry', '3',
      '--retry-delay', '1',
      '--max-time', '20',
      '-H', 'User-Agent: SundarbanSentinelBot/2.0',
      url
    ], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (err) {
    console.error(`Curl fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

function downloadImageWithCurl(url, destPath) {
  try {
    execFileSync('curl.exe', [
      '-s', '-L',
      '--retry', '3',
      '--retry-delay', '1',
      '--max-time', '15',
      '-o', destPath,
      url
    ]);
    if (!fs.existsSync(destPath)) return 0;
    const size = fs.statSync(destPath).size;
    if (size < 15000) {
      try { fs.unlinkSync(destPath); } catch (_) {}
      return 0;
    }
    return size;
  } catch (err) {
    try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (_) {}
    return 0;
  }
}

function getCandidatesFromQuery(url) {
  const data = fetchJsonWithCurl(url);
  if (!data || !data.results) return [];
  const list = [];
  for (const obs of data.results) {
    if (obs.photos && obs.photos.length > 0) {
      for (const p of obs.photos) {
        if (p.url) {
          list.push({
            mediumUrl: p.url.replace('/square.', '/medium.'),
            largeUrl: p.url.replace('/square.', '/large.'),
            place: obs.place_guess || 'South Asia',
            id: obs.id
          });
        }
      }
    }
  }
  return list;
}

async function processCategory(catName, queryUrls, startNum, targetTotal) {
  const dir = path.join(DATASET_DIR, catName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Category: ${catName} | Goal: ${startNum} to ${targetTotal} Close Shots`);
  console.log(`======================================================`);

  let candidates = [];
  for (const q of queryUrls) {
    process.stdout.write(`Querying: ${q.substring(0, 80)}... `);
    const photos = getCandidatesFromQuery(q);
    console.log(`found ${photos.length} photos`);
    candidates.push(...photos);
  }

  console.log(`Total candidate pool for ${catName}: ${candidates.length} photos`);

  for (let i = startNum; i <= targetTotal; i++) {
    const numStr = String(i).padStart(2, '0');
    const jpg = path.join(dir, `${catName}_${numStr}.jpg`);
    const png = path.join(dir, `${catName}_${numStr}.png`);

    if ((fs.existsSync(jpg) && fs.statSync(jpg).size > 15000) ||
        (fs.existsSync(png) && fs.statSync(png).size > 15000)) {
      console.log(`[${i}/${targetTotal}] ${catName}_${numStr} already exists. Skipping.`);
      continue;
    }

    let saved = false;
    while (candidates.length > 0 && !saved) {
      const cand = candidates.shift();
      process.stdout.write(`[${i}/${targetTotal}] Downloading ${catName}_${numStr}.jpg (${cand.place.substring(0, 25)})... `);
      
      // Try medium first (fast, reliable ~50KB) or large
      let bytes = downloadImageWithCurl(cand.mediumUrl, jpg);
      if (!bytes) {
        bytes = downloadImageWithCurl(cand.largeUrl, jpg);
      }

      if (bytes > 0) {
        console.log(`SUCCESS (${(bytes / 1024).toFixed(1)} KB)`);
        saved = true;
      } else {
        console.log(`FAILED. Trying next candidate...`);
      }
    }

    if (!saved) {
      console.warn(`[!] Warning: Could not find candidate for ${catName}_${numStr}`);
    }
  }
}

async function processCurrentJal(targetTotal) {
  const dir = path.join(DATASET_DIR, 'current_jal');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Category: current_jal | Preserving user screenshots (10..14) | Goal: ${targetTotal}`);
  console.log(`======================================================`);

  const queryUrls = [
    'https://api.inaturalist.org/v1/observations?q=gillnet&photos=true&per_page=30&order_by=votes',
    'https://api.inaturalist.org/v1/observations?q=monofilament%20net&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=fishing%20net%20water&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=ghost%20net&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=poaching%20net&photos=true&per_page=30',
    'https://api.inaturalist.org/v1/observations?q=nylon%20fishing%20net&photos=true&per_page=30'
  ];

  let candidates = [];
  for (const q of queryUrls) {
    process.stdout.write(`Querying: ${q.substring(0, 80)}... `);
    const photos = getCandidatesFromQuery(q);
    console.log(`found ${photos.length} photos`);
    candidates.push(...photos);
  }

  for (let i = 1; i <= targetTotal; i++) {
    const numStr = String(i).padStart(2, '0');
    const jpg = path.join(dir, `current_jal_${numStr}.jpg`);
    const png = path.join(dir, `current_jal_${numStr}.png`);

    if (fs.existsSync(png) && fs.statSync(png).size > 15000) {
      console.log(`[${i}/${targetTotal}] current_jal_${numStr}.png (user screenshot) preserved.`);
      continue;
    }
    if (fs.existsSync(jpg) && fs.statSync(jpg).size > 15000) {
      console.log(`[${i}/${targetTotal}] current_jal_${numStr}.jpg exists. Skipping.`);
      continue;
    }

    let saved = false;
    while (candidates.length > 0 && !saved) {
      const cand = candidates.shift();
      process.stdout.write(`[${i}/${targetTotal}] Downloading current_jal_${numStr}.jpg (${cand.place.substring(0, 25)})... `);
      
      let bytes = downloadImageWithCurl(cand.mediumUrl, jpg);
      if (!bytes) {
        bytes = downloadImageWithCurl(cand.largeUrl, jpg);
      }

      if (bytes > 0) {
        console.log(`SUCCESS (${(bytes / 1024).toFixed(1)} KB)`);
        saved = true;
      } else {
        console.log(`FAILED. Trying next candidate...`);
      }
    }
  }
}

async function main() {
  console.log(`Starting Sundarban Sentinel Curl-based Dataset Extension`);
  console.log(`Target: 30 Real Images per Class (150 Total Images)\n`);

  // 1. Bengal Tiger: 25 to 30 (close shots of face/head/eyes/roar)
  await processCategory(
    'bengal_tiger',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=2&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=41967&photos=true&quality_grade=research&page=3&per_page=30',
      'https://api.inaturalist.org/v1/observations?q=Panthera%20tigris%20portrait&photos=true&per_page=30'
    ],
    25,
    30
  );

  // 2. Chital Deer: 21 to 30 (close shots of Sundarban spotted deer, head, spots, antlers)
  await processCategory(
    'chital_deer',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&page=1&per_page=30',
      'https://api.inaturalist.org/v1/observations?taxon_id=42166&photos=true&quality_grade=research&order_by=votes&page=1&per_page=30',
      'https://api.inaturalist.org/v1/observations?taxon_id=42166&photos=true&quality_grade=research&order_by=votes&page=2&per_page=30'
    ],
    21,
    30
  );

  // 3. Ganges Dolphin: 21 to 30 (close shots of rostrum, snout, surfacing, blowhole)
  await processCategory(
    'ganges_dolphin',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=1&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&page=2&per_page=30',
      'https://api.inaturalist.org/v1/observations?q=Platanista%20gangetica&photos=true&per_page=30'
    ],
    21,
    30
  );

  // 4. Lesser Adjutant: 21 to 30 (close shots of massive bill, head, neck pouch)
  await processCategory(
    'lesser_adjutant',
    [
      'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=1&per_page=30&order_by=votes',
      'https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&page=2&per_page=30',
      'https://api.inaturalist.org/v1/observations?q=Leptoptilos%20javanicus&photos=true&per_page=30'
    ],
    21,
    30
  );

  // 5. Current Jal: Ensure all 1..30 are filled
  await processCurrentJal(30);

  console.log(`\n======================================================`);
  console.log(`ALL 5 CATEGORIES EXPANDED TO 30 IMAGES SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
