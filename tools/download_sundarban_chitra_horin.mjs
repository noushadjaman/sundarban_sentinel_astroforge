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
  if (buffer.length < 10000) throw new Error(`File too small: ${buffer.length}`);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// Curated list of high-res close-up Sundarban Deer & Chitra Horin photos
const SUNDARBAN_CHITRA_HORIN_URLS = [
  // Wikimedia Commons - Sundarbans & Close-ups
  {
    title: 'Deer in Sundarbans 02 - Close up grazing',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Deer_in_Sundarbans_02.JPG',
  },
  {
    title: 'Deer in Sundarbans 04 - Standing in mangrove mudflat',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Deer_in_Sundarbans_04.JPG',
  },
  {
    title: 'Deer in Sundarbans 03 - Mangrove habitat',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Deer_in_Sundarbans_03.JPG',
  },
  {
    title: 'Spotted Deers of Sundarbans - Herd portrait',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Spotted_Deers_of_Sundarbans.jpg',
  },
  {
    title: 'Spotted deer close-up portrait with white spots',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Spotted_deer_close-up.jpg',
  },
  {
    title: 'Chital by Tisha Mukherjee - Sundarban close up',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Chital_by_Tisha_Mukherjee_15.jpg',
  },
  {
    title: 'Chital by Tisha Mukherjee - Mangrove close portrait',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chital_by_Tisha_Mukherjee_14.jpg',
  },
  {
    title: 'Axis axis DT Bangladesh Sundarbans National Park 3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Axis_axis_DT_%28BD_Sundarbans_PN%29_%283%29.jpg',
  },
  {
    title: 'Axis axis DT Bangladesh Sundarbans National Park 6',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Axis_axis_DT_%28BD_Sundarbans_PN%29_%286%29.jpg',
  },
  {
    title: 'Axis axis DT Bangladesh Sundarbans National Park 1',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Axis_axis_DT_%28BD_Sundarbans_PN%29_%281%29.jpg',
  },
  {
    title: 'Spotted deer 23099475453 - Alert close up',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Spotted_deer_%2823099475453%29.jpg',
  },
  // iNaturalist Research-Grade Sundarbans Spotted Deer Observations
  {
    title: 'Sundarbans National Park Gosaba Chitra Horin close up',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/717127356/large.jpg',
  },
  {
    title: 'Sundarban Gosaba to Dobanki Chital deer close portrait',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/713009620/large.jpg',
  },
  {
    title: 'Sundarban West Bengal Chital spotted deer grazing',
    url: 'https://static.inaturalist.org/photos/709709576/large.jpg',
  },
  {
    title: 'Sundarbans Spotted Deer close encounter',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/649964484/large.jpg',
  },
  {
    title: 'Sundarbans Chitra Horin clear spots',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/649277892/large.jpg',
  },
  {
    title: 'Sundarbans axis axis herd in trees',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/631481514/large.jpg',
  },
  {
    title: 'Sundarbans Chitra Horin mudflat bank portrait',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/629088636/large.jpg',
  },
  {
    title: 'Sundarbans spotted deer male with antlers',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/627680068/large.jpg',
  },
  {
    title: 'Sundarbans Chitra Horin doe and fawn',
    url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/615848574/large.jpg',
  },
];

async function main() {
  console.log(`\n========================================`);
  console.log(`Downloading 20 Close-Up Sundarban Deer / Chitra Horin Photos...`);
  console.log(`Destination: ${CHITAL_DIR}`);
  console.log(`========================================`);

  if (!fs.existsSync(CHITAL_DIR)) {
    fs.mkdirSync(CHITAL_DIR, { recursive: true });
  }

  let count = 0;
  for (let i = 0; i < SUNDARBAN_CHITRA_HORIN_URLS.length && count < 20; i++) {
    const item = SUNDARBAN_CHITRA_HORIN_URLS[i];
    const indexStr = String(count + 1).padStart(2, '0');
    const fileName = `chital_deer_${indexStr}.jpg`;
    const destPath = path.join(CHITAL_DIR, fileName);

    process.stdout.write(`[${count + 1}/20] Downloading ${fileName} (${item.title.substring(0, 45)})... `);
    try {
      const sizeBytes = await downloadFile(item.url, destPath);
      console.log(`SUCCESS (${(sizeBytes / 1024).toFixed(1)} KB)`);
      count++;
      await sleep(200);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\nCompleted: ${count}/20 close-up Sundarban Chitra Horin photos saved to ${CHITAL_DIR}.\n`);
}

main().catch(console.error);
