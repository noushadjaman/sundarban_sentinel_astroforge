import fs from 'node:fs';

async function fetchNetImages() {
  const queries = [
    'gillnet',
    'gill net',
    'monofilament net',
    'fishing net water',
    'fishing net river',
    'illegal fishing net',
    'drift net',
    'monofilament gill net'
  ];

  const urlMap = new Map();

  for (const q of queries) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=20&prop=imageinfo&iiprop=url|size|mime&format=json`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinelDataset/1.0' } });
      const data = await res.json();
      const pages = data.query?.pages ? Object.values(data.query.pages) : [];
      for (const p of pages) {
        const info = p.imageinfo?.[0];
        if (info?.url && info.mime?.startsWith('image/') &&
            !info.url.endsWith('.svg') &&
            !info.url.endsWith('.tif') &&
            !info.url.endsWith('.tiff') &&
            !info.url.endsWith('.webm') &&
            info.size > 20000) {
          urlMap.set(info.url, { title: p.title, url: info.url, size: info.size });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  console.log(`Found ${urlMap.size} distinct net images.`);
  const sample = Array.from(urlMap.values()).slice(0, 25);
  for (let i = 0; i < sample.length; i++) {
    console.log(`[${i + 1}] ${sample[i].title} (${(sample[i].size / 1024).toFixed(0)} KB)`);
  }
}

fetchNetImages();
