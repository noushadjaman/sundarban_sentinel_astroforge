async function test() {
  const queries = ['gillnet', 'fishing net', 'ghost net', 'cast net'];
  for (const q of queries) {
    const url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(q)}&photos=true&per_page=10`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SundarbanSentinel/1.0' } });
    const data = await res.json();
    console.log(`Query "${q}" on iNaturalist: ${data.total_results} observations`);
  }
}
test();
