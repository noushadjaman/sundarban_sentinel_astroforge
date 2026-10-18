import fs from 'node:fs';
import path from 'node:path';

async function fetchCandidateUrls(queryUrl) {
  try {
    const res = await fetch(queryUrl, { headers: { 'User-Agent': 'SundarbanSentinelCloseShots/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    const photos = [];
    for (const obs of (data.results || [])) {
      if (obs.photos && obs.photos.length > 0) {
        for (const p of obs.photos) {
          if (p.url) {
            photos.push({
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
    return photos;
  } catch (err) {
    console.error('Fetch error:', err.message);
    return [];
  }
}

async function testAll() {
  console.log('Testing close shot candidate pools...');

  // Tiger
  const tiger = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?taxon_id=41967&quality_grade=research&photos=true&order_by=votes&page=2&per_page=30');
  console.log(`Tiger candidates: ${tiger.length}`);

  // Chital (Sundarbans)
  const deer = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?taxon_id=42166&q=Sundarban&photos=true&order_by=votes&per_page=30');
  console.log(`Sundarban Chital candidates: ${deer.length}`);

  // Dolphin
  const dolphin = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?taxon_id=41431&photos=true&order_by=votes&page=2&per_page=30');
  console.log(`Ganges Dolphin candidates: ${dolphin.length}`);

  // Adjutant
  const adjutant = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?taxon_id=4749&quality_grade=research&photos=true&order_by=votes&page=2&per_page=30');
  console.log(`Lesser Adjutant candidates: ${adjutant.length}`);

  // Net
  const net1 = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?q=gillnet&photos=true&per_page=30');
  const net2 = await fetchCandidateUrls('https://api.inaturalist.org/v1/observations?q=fishing%20net%20water&photos=true&per_page=30');
  console.log(`Net candidates: ${net1.length + net2.length}`);
}

testAll();
