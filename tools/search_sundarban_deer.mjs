async function searchWikimedia(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
    const data = await res.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    return pages
      .map(p => {
        const info = p.imageinfo?.[0];
        return {
          title: p.title,
          url: info?.url,
          size: info?.size,
          mime: info?.mime
        };
      })
      .filter(item => item.url && item.mime?.startsWith('image/') && !item.url.endsWith('.svg') && !item.url.endsWith('.tif') && !item.url.endsWith('.tiff'));
  } catch (e) {
    return [];
  }
}

async function searchINaturalistSundarbanDeer() {
  // place_id for Bangladesh or query string Sundarbans
  const url = `https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarbans&photos=true&per_page=20`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
    const data = await res.json();
    return (data.results || []).map(obs => ({
      title: `${obs.taxon?.name} at ${obs.place_guess}`,
      url: obs.photos?.[0]?.url?.replace('/square.', '/large.'),
      obsId: obs.id
    }));
  } catch (e) {
    return [];
  }
}

async function run() {
  const wikiQueries = [
    'Sundarbans deer',
    'Sundarban spotted deer',
    'Sundarbans chital',
    'Axis axis Sundarbans',
    'chital close up',
    'spotted deer close up'
  ];

  console.log('--- WIKIMEDIA COMMONS ---');
  for (const q of wikiQueries) {
    const res = await searchWikimedia(q);
    console.log(`Query "${q}" found: ${res.length} photos`);
    for (const r of res.slice(0, 3)) {
      console.log(`  ${r.title} (${(r.size / 1024).toFixed(0)} KB) -> ${r.url.substring(0, 80)}...`);
    }
  }

  console.log('\n--- iNATURALIST SUNDARBANS ---');
  const inat = await searchINaturalistSundarbanDeer();
  console.log(`Found ${inat.length} iNaturalist Sundarban chital observations`);
  for (const r of inat.slice(0, 5)) {
    console.log(`  ${r.title} -> ${r.url}`);
  }
}

run();
