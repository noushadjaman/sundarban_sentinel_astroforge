import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const baseDir = fs.existsSync(path.resolve('editnews/poison'))
  ? path.resolve('editnews/poison')
  : path.resolve('editnews/thedailystar');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBase64DataUrl(fileName) {
  const filePath = path.join(baseDir, fileName);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading assets from editnews/thedailystar...');
const logoImg = getBase64DataUrl('Screenshot 2026-09-29 192037.png');
const photo1Ranger = getBase64DataUrl('Screenshot 2026-09-29 192100.png');
const photo2Shed = getBase64DataUrl('Screenshot 2026-09-29 192118.png');

console.log('Assets loaded. Generating landscape newspaper editorial design...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Daily Star - Sundarbans Poison Raid</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&family=Cinzel:wght@700;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #ffffff;
      color: #1a1a1a;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      padding: 32px 50px;
      position: relative;
    }

    /* Subtle paper texture border for video broadcast */
    .page-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid #e0e0e0;
      box-shadow: 0 0 40px rgba(0,0,0,0.06);
      background: #ffffff;
      padding: 24px 36px 20px 36px;
    }

    /* Masthead Header */
    .masthead-wrapper {
      border-bottom: 2px solid #111111;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .top-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #d4d4d4;
      padding-bottom: 6px;
      margin-bottom: 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: #555555;
      text-transform: uppercase;
    }

    .masthead-center {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-container {
      height: 52px;
    }

    .logo-container img {
      height: 100%;
      object-fit: contain;
    }

    .edition-tag {
      text-align: right;
      font-size: 12px;
      color: #444444;
      line-height: 1.4;
    }

    .edition-tag strong {
      font-size: 13px;
      color: #111111;
      letter-spacing: 0.5px;
    }

    /* Headline & Subhead */
    .headline-section {
      margin-bottom: 20px;
    }

    .headline-category {
      display: inline-block;
      background: #c62828;
      color: #ffffff;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      padding: 3px 10px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .article-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 34px;
      font-weight: 900;
      line-height: 1.18;
      color: #0a0a0a;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .article-subhead {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 16px;
      font-style: italic;
      color: #444444;
      line-height: 1.4;
      max-width: 1550px;
    }

    /* Main Content Layout: Photos (Left) + News Text Columns (Right) */
    .content-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 780px 1fr 1fr;
      gap: 32px;
      overflow: hidden;
    }

    /* Left: Dual Photo Gallery */
    .photo-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .photo-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      border: 1px solid #dcdcdc;
      background: #f8f8f8;
      display: flex;
      flex-direction: column;
    }

    .photo-card.top {
      height: 290px;
    }

    .photo-card.bottom {
      height: 275px;
    }

    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-caption-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%);
      color: #ffffff;
      padding: 10px 14px 8px 14px;
      font-size: 11px;
      line-height: 1.35;
    }

    .photo-badge {
      display: inline-block;
      background: #c62828;
      color: white;
      font-weight: 800;
      font-size: 9px;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 2px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    /* Middle & Right: Organized News Text Columns */
    .text-column {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.62;
      color: #222222;
      text-align: justify;
    }

    .text-column p {
      margin-bottom: 14px;
    }

    .dropcap-char {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 56px;
      font-weight: 900;
      float: left;
      line-height: 0.82;
      padding-right: 10px;
      padding-top: 4px;
      color: #0a0a0a;
    }

    .dateline-tag {
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.8px;
      color: #b71c1c;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    /* Evidence Box */
    .evidence-box {
      font-family: 'Inter', sans-serif;
      background: #fff8f8;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      border-radius: 6px;
      padding: 12px 14px;
      margin: 14px 0 0 0;
    }

    .evidence-title {
      font-weight: 900;
      font-size: 11px;
      color: #991b1b;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .evidence-list {
      font-size: 11.5px;
      line-height: 1.48;
      color: #374151;
    }

    /* Pull Quote Box */
    .pull-quote {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 15px;
      font-style: italic;
      font-weight: 700;
      line-height: 1.38;
      color: #991b1b;
      background: #fef2f2;
      border-top: 2px solid #dc2626;
      border-bottom: 2px solid #dc2626;
      padding: 12px 14px;
      margin: 12px 0 0 0;
      text-align: left;
    }

    .quote-author {
      font-family: 'Inter', sans-serif;
      font-size: 10.5px;
      font-weight: 800;
      font-style: normal;
      color: #1f2937;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quote-role {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 500;
      text-transform: none;
    }

    /* Footer Ticker */
    .newspaper-footer {
      border-top: 1px solid #111111;
      padding-top: 8px;
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      font-weight: 700;
      color: #555555;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="page-frame">
    <!-- Masthead -->
    <header class="masthead-wrapper">
      <div class="top-meta-row">
        <span>The Daily Star • Bangladesh's Leading English Daily</span>
        <span>Environment & Climate Watch</span>
        <span>Vol. XXXV No. 248 • 16 Pages • Dhaka</span>
      </div>
      <div class="masthead-center">
        <div class="logo-container">
          <img src="${logoImg}" alt="The Daily Star Logo" />
        </div>
        <div class="edition-tag">
          <strong>EXCLUSIVE INVESTIGATION REPORT</strong><br>
          Sundarbans East Forest Division • Chandpai Range
        </div>
      </div>
    </header>

    <!-- Headline -->
    <section class="headline-section">
      <div class="headline-category">SUNDARBANS FOREST CRIME // POISON FISHING NETWORK</div>
      <h1 class="article-headline">Raid uncovers suspected poison-linked shrimp processing network inside Sundarbans</h1>
      <p class="article-subhead">Three illegal camps dismantled as officials seize suspected poison, shrimp and fishing equipment during day-long drive</p>
    </section>

    <!-- Main Grid: Left Photos + Middle Text + Right Text -->
    <main class="content-grid">
      <!-- Left: Dual Photos -->
      <aside class="photo-panel">
        <div class="photo-card top">
          <img src="${photo1Ranger}" alt="Forest officer carrying seized sack" />
          <div class="photo-caption-bar">
            <span class="photo-badge">SEIZED CONTRABAND</span><br>
            A forest guard wades through mangrove mud carrying seized shrimp and equipment away from illegal processing camps. In the background, boats and chemical cans remain tied in tidal creek.
          </div>
        </div>
        <div class="photo-card bottom">
          <img src="${photo2Shed}" alt="Forest officials raiding the illegal processing shed" />
          <div class="photo-caption-bar">
            <span class="photo-badge">DISMANTLED SHELTER</span><br>
            Chandpai range officers inspect an illegal dried-shrimp processing shelter built deep inside Charaputia forest, finding smoldering timber beds and extensive chemical drying equipment.
          </div>
        </div>
      </aside>

      <!-- Middle Column: News Text Part 1 -->
      <article class="text-column">
        <div class="dateline-tag">📍 KHULNA / SUNDARBANS EAST DIVISION</div>
        <p>
          <span class="dropcap-char">A</span> day-long Forest Department raid in the Sundarbans led to the demolition of three illegal camps linked to suspected poison-based dried shrimp processing.
        </p>
        <p>
          The operation, conducted by the Chandpai range authorities from 7:30am to 7:30pm on July 30, targeted the Charaputia area under the Sundarbans East Forest Division, said Divisional Forest Officer (DFO) Rezaul Karim Chowdhury.
        </p>
        <p>
          According to forest officials, the illegal camps were located at the mouths of Kaga Khal, Indurkani Khal and Chhoto Hormal Khal.
        </p>
        <p>
          The first two had already been abandoned when officials reached, but the third contained extensive evidence of shrimp processing.
        </p>

        <!-- Structured Evidence Callout Box -->
        <div class="evidence-box">
          <div class="evidence-title">
            <span>⚠️</span> SEIZED IN CHARAPUTIA RAID
          </div>
          <div class="evidence-list">
            • <strong>2 sacks</strong> of processed dried shrimp<br>
            • <strong>5 maunds (~200 kg)</strong> fresh shrimp on drying beds<br>
            • <strong>2 litres</strong> of suspected lethal poison<br>
            • <strong>2 trawler boats</strong> & <strong>2 tona nets</strong><br>
            • <strong>95 crab traps</strong> confiscated from fleeing syndicates<br>
            • <strong>3 sacks of rice</strong> & processing apparatus
          </div>
        </div>
      </article>

      <!-- Right Column: News Text Part 2 -->
      <article class="text-column">
        <p>
          Officials recovered two sacks of dried shrimp, about five maunds of fresh shrimp laid out for drying, two litres of suspected poison, two boats, two tona nets, three sacks of rice and other processing equipment, the DFO said.
        </p>
        <p>
          The fresh shrimp emitted a strong smell of poison, prompting officials to destroy the entire haul on the spot to prevent it from reaching local markets, he added.
        </p>
        <p>
          During the same drive, forest officials also seized a boat carrying 95 crab traps after those on board fled into the forest. A case is being prepared over the incident.
        </p>
        <p>
          <em>"We will continue such drives to stop illegal activities inside the Sundarbans,"</em> Rezaul said.
        </p>
        <p style="margin-bottom: 6px;">
          Environmental campaigners said the raid exposed a wider problem.
        </p>

        <!-- Pull Quote -->
        <div class="pull-quote">
          "The use of poison is silently destroying the Sundarbans. The chemicals contaminate water, kill aquatic life and threaten the entire ecosystem. Unless enforcement is strengthened, these illegal activities will continue."
          <div class="quote-author">
            — Noor Alam
            <div class="quote-role">Coordinator, Sundarban Rokkhay Amra</div>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="newspaper-footer">
      <span>The Daily Star Special Investigation • Published: Tuesday, September 29, 2026</span>
      <span>Sundarbans Ecological Protection Desk</span>
      <span>Digital Broadcast Compositing Asset • 1920x1080 Landscape</span>
    </footer>
  </div>
</body>
</html>`;

const tempHtmlPath = path.join(baseDir, 'temp_landscape.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const fileUrl = pathToFileURL(tempHtmlPath).href;
const outPng1080 = path.join(baseDir, 'daily_star_poison_raid_landscape_1080p.png');
const outPng4K = path.join(baseDir, 'daily_star_poison_raid_landscape_4k.png');

console.log('Rendering 1920x1080 Landscape PNG...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng1080}" --window-size=1920,1080 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

console.log('Rendering 3840x2160 (4K UHD) Landscape PNG...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng4K}" --window-size=1920,1080 --force-device-scale-factor=2 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

// Also copy or save to project_assets/news for convenient Premiere Pro workflow
const projectAssetsDest = path.resolve('project_assets/news/daily_star_poison_raid_landscape_1080p.png');
fs.copyFileSync(outPng1080, projectAssetsDest);

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

console.log('Finished rendering all versions successfully!');
