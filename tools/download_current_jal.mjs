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
  if (buffer.length < 10000) throw new Error(`File too small: ${buffer.length}`);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

const GILLNET_PHOTOS = [
  {
    title: 'Nylon Monofilament Net texture and mesh',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nylon_Monofilament_Net.jpg',
  },
  {
    title: 'Fisheries officer checking nylon gill net full of fish',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Fish_and_Wildlife_Service_worker_on_boat_checking_gill_net_full_of_fish.jpg',
  },
  {
    title: 'Gill net fishing deployed in river 1',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/GILL_NET_FISHING_ON_THE_COLUMBIA_RIVER_-_NARA_-_545054.jpg',
  },
  {
    title: 'Gill net fishing deployed in river 2',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/GILL_NET_FISHING_ON_THE_COLUMBIA_RIVER_-_NARA_-_545055.jpg',
  },
  {
    title: 'Gill net fishing deployed in river 3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/GILL_NET_FISHING_ON_THE_COLUMBIA_RIVER_-_NARA_-_545056.jpg',
  },
  {
    title: 'Gill net fishing deployed in river 4',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/GILL_NET_FISHING_ON_THE_COLUMBIA_RIVER_-_NARA_-_545057.jpg',
  },
  {
    title: 'Gill net fishing deployed in river 5',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/GILL_NET_FISHING_ON_THE_COLUMBIA_RIVER_-_NARA_-_545058.jpg',
  },
  {
    title: 'Gill net fishing in water from boat',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/31/LARRY_SCHAUB_IS_GILL_NET_FISHING_IN_THE_COLUMBIA_RIVER_-_NARA_-_545306.jpg',
  },
  {
    title: 'Mending gillnet on dock',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/MENDING_A_GILLNET_ON_THE_DOCK_AT_ST._HELENS_ON_THE_COLUMBIA_RIVER_-_NARA_-_548102.jpg',
  },
  {
    title: 'Fish caught in fine monofilament gill net mesh',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Removing_salmon_from_gillnet.jpg',
  },
  {
    title: 'Coast Guard seizing illegal fishing nets',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Coast_Guard_takes_measures_against_illegal%2C_unregulated%2C_unreported_fishing_at_TRADEWINDS_24_%288399926%29.jpg',
  },
  {
    title: 'Gill net fishing South Asia Malvan coast',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Gill_net_fishing_Malvan.jpg',
  },
  {
    title: 'Seine net and monofilament mesh in water',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Seine_net_fishermen-_Sarasota%2C_Florida_%288683621632%29.jpg',
  },
  {
    title: 'Gill net hauled over power-driven drum on water',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Gill_net_hauled_in_over_a_power-driven_drum.jpg',
  },
  {
    title: 'Gill net Cod fishery set in coastal water',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/FMIB_50824_Gill-Net_Cod_Fishery.jpeg',
  },
  {
    title: 'Gill-Net Rigs and monofilament webbing',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/FMIB_34029_Gill-Net_Rigs.jpeg',
  },
  {
    title: 'Chinese style gill net fishing in estuary',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/FMIB_33398_Chinese_Gill-Net_Fishing.jpeg',
  },
  {
    title: 'Fisherman setting drift net in river',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/FMIB_41454_Gill-Net_Fishing_on_the_Columbia_River.jpeg',
  },
  {
    title: 'Gillnet mark on escaped fish',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/FMIB_44468_Chinook_Salmon_Escaped_from_Gillnet_Showing_how_nets_left_their_marks_on_body_and_dorsal_fins.jpeg',
  },
  {
    title: 'Salmon gill net boats deployed with nets in bay',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/FMIB_35459_Salmon_Gill-Net_Fishing_Boats%2C_Bristol_Bay.jpeg',
  },
];

async function main() {
  console.log(`\n========================================`);
  console.log(`Downloading 20 Real Current Jal (Gillnet / Poaching Nets) Photos...`);
  console.log(`Destination: ${NET_DIR}`);
  console.log(`========================================`);

  if (!fs.existsSync(NET_DIR)) {
    fs.mkdirSync(NET_DIR, { recursive: true });
  }

  let count = 0;
  for (let i = 0; i < GILLNET_PHOTOS.length && count < 20; i++) {
    const item = GILLNET_PHOTOS[i];
    const indexStr = String(count + 1).padStart(2, '0');
    const fileName = `current_jal_${indexStr}.jpg`;
    const destPath = path.join(NET_DIR, fileName);

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

  console.log(`\nCompleted: ${count}/20 real Current Jal photos saved to ${NET_DIR}.\n`);
}

main().catch(console.error);
