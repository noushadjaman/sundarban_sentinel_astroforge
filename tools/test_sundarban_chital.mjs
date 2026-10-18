async function checkSundarbanChital() {
  const url = 'https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&per_page=40';
  const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
  const data = await res.json();
  console.log('Total Sundarban Chital observations found:', data.total_results);
  const photos = [];
  for (const obs of data.results) {
    if (obs.photos && obs.photos.length > 0) {
      for (const p of obs.photos) {
        photos.push({
          obsId: obs.id,
          place: obs.place_guess,
          url: p.url.replace('/square.', '/large.'),
          thumb: p.url.replace('/square.', '/medium.')
        });
      }
    }
  }
  console.log(`Total photos available: ${photos.length}`);
  for (let i = 0; i < Math.min(10, photos.length); i++) {
    console.log(`[${i+1}] ${photos[i].place} -> ${photos[i].url}`);
  }
}

checkSundarbanChital();
