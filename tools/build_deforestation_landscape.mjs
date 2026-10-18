import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const baseDir = path.resolve('editnews/deforestration');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBase64(fileName) {
  const filePath = path.join(baseDir, fileName);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading deforestation & ecosystem assets from editnews/deforestration...');
const logoImg = getBase64('Screenshot 2026-09-29 193606.png');
const photoDeer = getBase64('Screenshot 2026-09-29 193559.png');
const photoMonkeys = getBase64('Screenshot 2026-09-29 193706.png');
const photoAerial = getBase64('Screenshot 2026-09-29 193715.png');

console.log('Assets loaded. Generating Page 1 & Page 2 HTML templates...');

// PAGE 1: The Natural Shield & Livelihood Engine
const htmlPage1 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Daily Star - Sundarbans: The Forest That Protects, Feeds and Sustains (Part 1)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Inter:wght@400;500;600;700;800;900&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #ffffff;
      color: #111827;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      padding: 24px 38px;
    }

    .page-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      padding: 18px 32px 16px 32px;
      overflow: hidden;
    }

    /* Masthead */
    .masthead-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #064e3b;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .logo-container {
      height: 52px;
    }

    .logo-container img {
      height: 100%;
      object-fit: contain;
    }

    .masthead-divider {
      height: 38px;
      width: 2px;
      background: #cbd5e1;
    }

    .desk-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #047857;
      text-transform: uppercase;
    }

    .edition-tag {
      text-align: right;
      font-size: 12.5px;
      color: #475569;
      font-weight: 600;
      line-height: 1.4;
    }

    .edition-tag strong {
      color: #064e3b;
      font-size: 13.5px;
      font-weight: 800;
    }

    /* Headline Section with Bold & Large typography */
    .headline-container {
      margin-bottom: 16px;
    }

    .category-badge {
      display: inline-block;
      background: #047857;
      color: #ffffff;
      font-weight: 900;
      font-size: 11.5px;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .page-indicator {
      display: inline-block;
      background: #064e3b;
      color: #d1fae5;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 3px;
      margin-left: 8px;
      text-transform: uppercase;
    }

    .article-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 900;
      line-height: 1.14;
      color: #064e3b;
      letter-spacing: -0.6px;
      margin-bottom: 6px;
    }

    .article-subhead {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 20px;
      font-style: italic;
      color: #334155;
      line-height: 1.38;
      font-weight: 400;
      max-width: 1750px;
    }

    /* Main Grid Layout: Left Photos + Right 2 Columns of Large Text */
    .main-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 780px 1fr 1fr;
      gap: 26px;
      overflow: hidden;
    }

    /* Left Panel: Aerial View + Deer Shoreline + Quick Stat Cards */
    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dual-photo-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 270px;
    }

    .photo-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
      background: #0f172a;
    }

    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 80%, transparent 100%);
      color: #ffffff;
      padding: 10px 12px 8px 12px;
      font-size: 11.5px;
      line-height: 1.35;
    }

    .photo-badge {
      display: inline-block;
      background: #047857;
      color: #ffffff;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 2px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* 4 Key Shield & Economic Stats */
    .stat-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .stat-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 5px solid #059669;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 900;
      color: #047857;
      line-height: 1;
      white-space: nowrap;
    }

    .stat-desc {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      line-height: 1.3;
    }

    .stat-desc strong {
      color: #064e3b;
      font-weight: 800;
    }

    /* Editorial Text Columns */
    .story-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-body {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 17.5px;
      line-height: 1.62;
      color: #1f2937;
      text-align: justify;
    }

    .story-body p {
      margin-bottom: 12px;
    }

    .dateline {
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      font-size: 13.5px;
      letter-spacing: 0.8px;
      color: #047857;
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }

    .story-body strong {
      color: #064e3b;
      font-weight: 700;
    }

    /* Quote Box */
    .quote-box {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17.5px;
      font-style: italic;
      font-weight: 700;
      line-height: 1.38;
      color: #064e3b;
      background: #ecfdf5;
      border-top: 3px solid #059669;
      border-bottom: 3px solid #059669;
      border-radius: 4px;
      padding: 14px 18px;
      margin-top: 6px;
    }

    .quote-signoff {
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      font-style: normal;
      color: #1e293b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quote-designation {
      font-size: 11.5px;
      font-weight: 500;
      color: #64748b;
      text-transform: none;
    }

    /* Callout Box */
    .biodiversity-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      line-height: 1.45;
      color: #334155;
    }

    .biodiversity-title {
      font-weight: 900;
      font-size: 11.5px;
      letter-spacing: 0.8px;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    /* Footer */
    .footer-bar {
      border-top: 1.5px solid #064e3b;
      padding-top: 8px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="page-frame">
    <!-- Masthead -->
    <header class="masthead-wrapper">
      <div class="brand-box">
        <div class="logo-container">
          <img src="${logoImg}" alt="The Daily Star Logo" />
        </div>
        <div class="masthead-divider"></div>
        <div class="desk-title">SPECIAL INVESTIGATION • ECOLOGICAL DEFENSE & BIODIVERSITY</div>
      </div>
      <div class="edition-tag">
        <strong>THE DAILY STAR SPECIAL IN-DEPTH REPORT (PART 1)</strong><br>
        Published: Tuesday, September 29, 2026 • Sundarbans Mangrove Hub
      </div>
    </header>

    <!-- Headings -->
    <section class="headline-container">
      <div>
        <span class="category-badge">NATURAL SHIELD & SUSTENANCE</span>
        <span class="page-indicator">PAGE 1 OF 2 // THE LIVING FORTRESS</span>
      </div>
      <h1 class="article-headline">Sundarbans: The forest that protects, feeds and sustains</h1>
      <p class="article-subhead">It is one of the world’s most remarkable hubs of biodiversity, shielding Bangladesh from violent cyclones and sustaining millions of coastal livelihoods</p>
    </section>

    <!-- Main Grid -->
    <main class="main-grid">
      <!-- Col 1: Visuals & Metrics -->
      <aside class="left-panel">
        <div class="dual-photo-row">
          <div class="photo-card">
            <img src="${photoAerial}" alt="Aerial river network of Sundarbans" />
            <div class="photo-caption">
              <span class="photo-badge">NATURAL BUFFER NETWORK</span><br>
              Aerial view of tidal rivers and creeks that absorb wave energy and regulate monsoon flows.
            </div>
          </div>
          <div class="photo-card">
            <img src="${photoDeer}" alt="Spotted deer grazing on shoreline" />
            <div class="photo-caption">
              <span class="photo-badge">COASTAL WILDLIFE HABITAT</span><br>
              Spotted deer grazing along tidal mudflats, sustained by the mangrove canopy.
            </div>
          </div>
        </div>

        <div class="stat-row-grid">
          <div class="stat-card">
            <div class="stat-number">$543M</div>
            <div class="stat-desc">
              <strong>Disaster Shield:</strong> Prevented damages worth $543M during Cyclone Sidr alone.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">12,000+</div>
            <div class="stat-desc">
              <strong>Local Fishers:</strong> Dependent directly on forest waterways for their livelihood.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$145M</div>
            <div class="stat-desc">
              <strong>Coastal Economy:</strong> Annual value generated from honey, fish, and golpata.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$3,600</div>
            <div class="stat-desc">
              <strong>Carbon Value / Ha:</strong> Annual carbon sequestration value per hectare of forest.
            </div>
          </div>
        </div>
      </aside>

      <!-- Col 2: High-Readability Editorial Story Part 1 -->
      <article class="story-col">
        <div class="story-body">
          <span class="dateline">SUNDARBANS DELTA:</span>
          <p>
            The Sundarbans stands as one of the world's most remarkable hubs of biodiversity. Together, its trees, waterways, soil, wildlife and microorganisms form a vast living network where every link is crucial.
          </p>
          <p>
            The forest acts as Bangladesh's <strong>primary natural shield against extreme weather</strong>. Standing between the Bay of Bengal and vulnerable settlements, its dense vegetation and tangled roots absorb wave energy and blunt storm surges.
          </p>
          <p>
            Over the past decades, this living barrier has shielded the country against ferocious cyclones, including <strong>Sidr, Aila, Roanu, Fani, Bulbul, Amphan, Yaas and Remal</strong>.
          </p>
        </div>

        <div class="biodiversity-box">
          <div class="biodiversity-title">🌿 OFFICIAL SPECIES COUNT (FOREST DEPT.)</div>
          • <strong>528 Plant Species</strong> & <strong>210 Fish Species</strong><br>
          • <strong>355 Bird Species</strong> & <strong>87 Reptile Species</strong><br>
          • <strong>505 Other Wildlife Species</strong> led by the Bengal tiger.
        </div>
      </article>

      <!-- Col 3: High-Readability Editorial Story Part 2 & Fisherman Quote -->
      <article class="story-col">
        <div class="story-body">
          <p>
            Much of the forest’s wealth lies beneath the surface. Its aquatic landscape of rivers and tidal channels provides essential feeding, breeding, and nursery grounds for fish and shrimp.
          </p>
          <p>
            Linked to estuaries and the Bay of Bengal through complex tidal flows, the Sundarbans sustains marine resources that feed families and support an annual coastal economy exceeding <strong>US$ 145 million</strong>.
          </p>
        </div>

        <!-- Pull Quote -->
        <div class="quote-box">
          "I have been fishing in the Sundarbans for the past 45 years and earning a livelihood for my six family members. The forest is like a mother who feeds me."
          <div class="quote-signoff">
            — Shibapada Biswas
            <div class="quote-designation">Fisherman from Khalashibunia, Batiaghata, Khulna</div>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="footer-bar">
      <span>The Daily Star In-Depth Investigation • Broadcast 16:9 Landscape Asset</span>
      <span>Forest Department & IUCN Coastal Resilience Studies</span>
      <span>Page 1 of 2 • Ultra HD 4K / 1080p Video Ready</span>
    </footer>
  </div>
</body>
</html>`;


// PAGE 2: Ecological Vulnerability, Top-Dying & Salinity Crisis
const htmlPage2 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Daily Star - Sundarbans: The Forest That Protects, Feeds and Sustains (Part 2)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Inter:wght@400;500;600;700;800;900&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #ffffff;
      color: #111827;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      padding: 24px 38px;
    }

    .page-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      padding: 18px 32px 16px 32px;
      overflow: hidden;
    }

    /* Masthead */
    .masthead-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #831843;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .logo-container {
      height: 52px;
    }

    .logo-container img {
      height: 100%;
      object-fit: contain;
    }

    .masthead-divider {
      height: 38px;
      width: 2px;
      background: #cbd5e1;
    }

    .desk-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #be185d;
      text-transform: uppercase;
    }

    .edition-tag {
      text-align: right;
      font-size: 12.5px;
      color: #475569;
      font-weight: 600;
      line-height: 1.4;
    }

    .edition-tag strong {
      color: #831843;
      font-size: 13.5px;
      font-weight: 800;
    }

    /* Headings */
    .headline-container {
      margin-bottom: 16px;
    }

    .category-badge {
      display: inline-block;
      background: #be185d;
      color: #ffffff;
      font-weight: 900;
      font-size: 11.5px;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .page-indicator {
      display: inline-block;
      background: #831843;
      color: #fce7f3;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 3px;
      margin-left: 8px;
      text-transform: uppercase;
    }

    .article-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 900;
      line-height: 1.14;
      color: #831843;
      letter-spacing: -0.6px;
      margin-bottom: 6px;
    }

    .article-subhead {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 20px;
      font-style: italic;
      color: #334155;
      line-height: 1.38;
      font-weight: 400;
      max-width: 1750px;
    }

    /* Main Grid */
    .main-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 780px 1fr 1fr;
      gap: 26px;
      overflow: hidden;
    }

    /* Left Panel: Photo + Threat Stat Cards */
    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .photo-card {
      position: relative;
      height: 310px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
      background: #0f172a;
    }

    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 80%, transparent 100%);
      color: #ffffff;
      padding: 10px 14px 8px 14px;
      font-size: 12px;
      line-height: 1.35;
    }

    .photo-badge {
      display: inline-block;
      background: #be185d;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 2px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* 4 Stat Cards */
    .stat-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .stat-card {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-left: 5px solid #e11d48;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 900;
      color: #be185d;
      line-height: 1;
      white-space: nowrap;
    }

    .stat-desc {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      line-height: 1.3;
    }

    .stat-desc strong {
      color: #831843;
      font-weight: 800;
    }

    /* Editorial Text Columns */
    .story-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-body {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 17.5px;
      line-height: 1.62;
      color: #1f2937;
      text-align: justify;
    }

    .story-body p {
      margin-bottom: 12px;
    }

    .dateline {
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      font-size: 13.5px;
      letter-spacing: 0.8px;
      color: #be185d;
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }

    .story-body strong {
      color: #831843;
      font-weight: 700;
    }

    /* Quote Box */
    .quote-box {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17px;
      font-style: italic;
      font-weight: 700;
      line-height: 1.38;
      color: #831843;
      background: #fff1f2;
      border-top: 3px solid #e11d48;
      border-bottom: 3px solid #e11d48;
      border-radius: 4px;
      padding: 14px 18px;
      margin-top: 6px;
    }

    .quote-signoff {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 800;
      font-style: normal;
      color: #1e293b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quote-designation {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      text-transform: none;
    }

    /* Scientific Findings Callout Box */
    .cegis-box {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-left: 4px solid #c026d3;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      line-height: 1.45;
      color: #374151;
    }

    .cegis-title {
      font-weight: 900;
      font-size: 11.5px;
      letter-spacing: 0.8px;
      color: #a21caf;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    /* Footer */
    .footer-bar {
      border-top: 1.5px solid #831843;
      padding-top: 8px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="page-frame">
    <!-- Masthead -->
    <header class="masthead-wrapper">
      <div class="brand-box">
        <div class="logo-container">
          <img src="${logoImg}" alt="The Daily Star Logo" />
        </div>
        <div class="masthead-divider"></div>
        <div class="desk-title">SPECIAL INVESTIGATION • SALINITY, SOIL & DEGRADATION</div>
      </div>
      <div class="edition-tag">
        <strong>THE DAILY STAR SPECIAL IN-DEPTH REPORT (PART 2)</strong><br>
        Published: Tuesday, September 29, 2026 • Ecological Threat Analysis
      </div>
    </header>

    <!-- Headings -->
    <section class="headline-container">
      <div>
        <span class="category-badge">ECOLOGICAL THREATS & TOP-DYING</span>
        <span class="page-indicator">PAGE 2 OF 2 // ECOLOGICAL PRESSURES</span>
      </div>
      <h1 class="article-headline">Sundarbans in Peril: Salinity, Top-Dying & Forest Strain</h1>
      <p class="article-subhead">Reduced freshwater flows from the Ganges, escalating soil phosphorus, and commercial encroachment place the iconic Sundari tree under existential risk</p>
    </section>

    <!-- Main Grid -->
    <main class="main-grid">
      <!-- Col 1: Visuals & Metrics -->
      <aside class="left-panel">
        <div class="photo-card">
          <img src="${photoMonkeys}" alt="Troop of monkeys roaming in forest clearing" />
          <div class="photo-caption">
            <span class="photo-badge">HABITAT AT RISK</span><br>
            A troop of rhesus macaques in a forest clearing. Altered soil nutrients and canopy die-offs directly disrupt wildlife foraging grounds.
          </div>
        </div>

        <div class="stat-row-grid">
          <div class="stat-card">
            <div class="stat-number">33%</div>
            <div class="stat-desc">
              <strong>Deterioration:</strong> One-third of the forest shows declining soil and vegetation health (CEGIS).
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$16.7M</div>
            <div class="stat-desc">
              <strong>Sundari Timber Loss:</strong> Annual value lost due to salinity-induced "top-dying" disease.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">328,000+</div>
            <div class="stat-desc">
              <strong>Annual Tourists:</strong> Massive visitor footfall creating an irreversible ecological footprint.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">Ganges</div>
            <div class="stat-desc">
              <strong>Freshwater Deficit:</strong> Upstream diversions intensify dry-season coastal saltwater intrusion.
            </div>
          </div>
        </div>
      </aside>

      <!-- Col 2: High-Readability Editorial Story Part 1 -->
      <article class="story-col">
        <div class="story-body">
          <span class="dateline">ECOLOGICAL RESEARCH:</span>
          <p>
            The future of the Sundarbans depends heavily on freshwater inflow to maintain its delicate ecological balance. A 2025 study confirms that <strong>declining upstream discharge from the Ganges</strong> has significantly worsened salinity.
          </p>
          <p>
            Increasing salinity, sea-level rise, and artificial shrimp enclosure farming are driving the widespread <strong>"top-dying" phenomenon</strong> in Sundari trees, where the upper canopy gradually withers away.
          </p>
          <p>
            A dying tree stores less carbon, binds less soil, and signals a broader breakdown across the entire interconnected mangrove food web.
          </p>
        </div>

        <div class="cegis-box">
          <div class="cegis-title">📊 CEGIS ECOLOGICAL MONITORING FINDINGS</div>
          • <strong>Two-thirds (67%)</strong> of the forest retains moderate ecological health.<br>
          • <strong>One-third (33%)</strong> suffers active soil and canopy deterioration.<br>
          • Excess soil phosphorus is weakening root functions during storm events.
        </div>
      </article>

      <!-- Col 3: High-Readability Editorial Story Part 2 & Scientist Warning -->
      <article class="story-col">
        <div class="story-body">
          <p>
            Soil scientists have also discovered an abnormal buildup of phosphorus that impairs root function and destabilizes trees ahead of severe cyclonic weather.
          </p>
          <p>
            With over 328,000 tourists visiting in the 2024-25 fiscal year, experts warn that uncontrolled footfall compounds environmental degradation across critical wildlife corridors.
          </p>
        </div>

        <!-- Pull Quote -->
        <div class="quote-box">
          "Further reduction in freshwater availability will increase salinity and put extreme pressure on valuable species such as Sundari. Proper environmental impact assessments and strict enforcement of the 1998 tree-cutting ban are essential to save the forest."
          <div class="quote-signoff">
            — Prof. Nabiul Islam Khan
            <div class="quote-designation">Department of Forestry & Wood Technology, Khulna University</div>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="footer-bar">
      <span>The Daily Star In-Depth Investigation • Broadcast 16:9 Landscape Asset</span>
      <span>CEGIS Ecological Monitoring & Khulna University Forestry Research</span>
      <span>Page 2 of 2 • Ultra HD 4K / 1080p Video Ready</span>
    </footer>
  </div>
</body>
</html>`;

// Render Page 1
const tempPage1 = path.join(baseDir, 'temp_page1.html');
fs.writeFileSync(tempPage1, htmlPage1, 'utf-8');
const url1 = pathToFileURL(tempPage1).href;

const p1_1080 = path.join(baseDir, 'sundarbans_protects_page1_1080p.png');
const p1_4k = path.join(baseDir, 'sundarbans_protects_page1_4k.png');

console.log('Rendering Page 1 in 1080p...');
execSync(`"${chromePath}" --headless=new --screenshot="${p1_1080}" --window-size=1920,1080 --hide-scrollbars "${url1}"`, { stdio: 'inherit' });

console.log('Rendering Page 1 in 4K UHD...');
execSync(`"${chromePath}" --headless=new --screenshot="${p1_4k}" --window-size=1920,1080 --force-device-scale-factor=2 --hide-scrollbars "${url1}"`, { stdio: 'inherit' });

if (fs.existsSync(tempPage1)) fs.unlinkSync(tempPage1);


// Render Page 2
const tempPage2 = path.join(baseDir, 'temp_page2.html');
fs.writeFileSync(tempPage2, htmlPage2, 'utf-8');
const url2 = pathToFileURL(tempPage2).href;

const p2_1080 = path.join(baseDir, 'sundarbans_protects_page2_1080p.png');
const p2_4k = path.join(baseDir, 'sundarbans_protects_page2_4k.png');

console.log('Rendering Page 2 in 1080p...');
execSync(`"${chromePath}" --headless=new --screenshot="${p2_1080}" --window-size=1920,1080 --hide-scrollbars "${url2}"`, { stdio: 'inherit' });

console.log('Rendering Page 2 in 4K UHD...');
execSync(`"${chromePath}" --headless=new --screenshot="${p2_4k}" --window-size=1920,1080 --force-device-scale-factor=2 --hide-scrollbars "${url2}"`, { stdio: 'inherit' });

if (fs.existsSync(tempPage2)) fs.unlinkSync(tempPage2);

// Mirror to project_assets/news
fs.copyFileSync(p1_1080, path.resolve('project_assets/news/sundarbans_protects_page1_1080p.png'));
fs.copyFileSync(p2_1080, path.resolve('project_assets/news/sundarbans_protects_page2_1080p.png'));

console.log('Successfully generated Page 1 and Page 2 in both 1080p and 4K!');
