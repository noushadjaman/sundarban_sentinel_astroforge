import fs from 'node:fs';
import path from 'node:path';

async function searchWikimedia(query, limit = 20) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SundarbanSentinelDatasetBot/1.0 (biodiversity@sentinel.org)' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    const results = [];
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (info?.url && info.mime?.startsWith('image/')) {
        results.push({
          title: page.title,
          url: info.url,
          width: info.width,
          height: info.height,
          size: info.size
        });
      }
    }
    return results;
  } catch (err) {
    console.error(`Wikimedia search error for ${query}:`, err.message);
    return [];
  }
}

async function test() {
  const queries = ['gillnet', 'gill net', 'fishing net water', 'monofilament net', 'illegal fishing net'];
  for (const q of queries) {
    const res = await searchWikimedia(q, 10);
    console.log(`Query "${q}" returned: ${res.length} images`);
    if (res.length > 0) {
      console.log(`   Sample: ${res[0].title} -> ${res[0].url.substring(0, 80)}...`);
    }
  }
}

test();
