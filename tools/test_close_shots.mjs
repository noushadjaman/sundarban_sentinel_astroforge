async function test() {
  const taxa = [
    { name: 'bengal_tiger', id: 41967, q: '' },
    { name: 'chital_deer', id: 42166, q: 'Sundarban' },
    { name: 'ganges_dolphin', id: 41431, q: '' },
    { name: 'lesser_adjutant', id: 4749, q: '' }
  ];

  for (const t of taxa) {
    const qParam = t.q ? `&q=${encodeURIComponent(t.q)}` : '';
    const url = `https://api.inaturalist.org/v1/observations?taxon_id=${t.id}${qParam}&photos=true&quality_grade=research&page=2&per_page=20&order_by=votes`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
    const data = await res.json();
    console.log(`${t.name} page 2 results:`, data.results?.length);
    if (data.results?.length > 0) {
      console.log(`  Sample 1: ${data.results[0].photos?.[0]?.url.replace('/square.', '/large.')}`);
      console.log(`  Sample 2: ${data.results[1]?.photos?.[0]?.url.replace('/square.', '/large.')}`);
    }
  }

  // Also test current_jal
  const netUrl = 'https://api.inaturalist.org/v1/observations?q=gillnet&photos=true&page=2&per_page=15';
  const netRes = await fetch(netUrl, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
  const netData = await netRes.json();
  console.log(`current_jal (gillnet page 2) results:`, netData.results?.length);
}

test().catch(console.error);
