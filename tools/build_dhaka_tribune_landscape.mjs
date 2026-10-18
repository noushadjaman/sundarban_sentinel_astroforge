import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const baseDir = path.resolve('editnews/dhakatribiun');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBase64(fileName) {
  const filePath = path.join(baseDir, fileName);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading Dhaka Tribune assets from editnews/dhakatribiun...');
const dtLogo = getBase64('Screenshot 2026-09-29 192444.png');
const photoPoachersVenison = getBase64('Screenshot 2026-09-29 192501.png');

console.log('Assets loaded. Generating broadcast landscape editorial page...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dhaka Tribune - 824kg venison seized in Sundarbans</title>
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
      padding: 26px 42px;
      position: relative;
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
      padding: 20px 34px 18px 34px;
      overflow: hidden;
    }

    /* Masthead */
    .masthead-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .logo-wrap {
      height: 62px;
      display: flex;
      align-items: center;
    }

    .logo-wrap img {
      height: 58px;
      object-fit: contain;
    }

    .masthead-divider {
      height: 44px;
      width: 2px;
      background: #cbd5e1;
    }

    .desk-title {
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #dc2626;
      text-transform: uppercase;
    }

    .meta-tags {
      text-align: right;
      font-size: 13px;
      color: #475569;
      font-weight: 600;
      line-height: 1.45;
    }

    .meta-tags strong {
      color: #0f172a;
      font-weight: 800;
      font-size: 14px;
    }

    /* Headings: Bold and Large */
    .headline-container {
      margin-bottom: 18px;
    }

    .category-badge {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      font-weight: 900;
      font-size: 12px;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .article-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 900;
      line-height: 1.15;
      color: #090e17;
      letter-spacing: -0.6px;
      margin-bottom: 8px;
    }

    .article-subhead {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 20.5px;
      font-style: italic;
      color: #334155;
      line-height: 1.4;
      font-weight: 400;
      max-width: 1750px;
    }

    /* Main Grid Layout: Left Photo + Right 2 Columns of Large Text */
    .main-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 780px 1fr 1fr;
      gap: 28px;
      overflow: hidden;
    }

    /* Left: Photo & Fast Fact Seizure Cards */
    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .photo-card {
      position: relative;
      height: 380px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
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
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 75%, transparent 100%);
      color: #ffffff;
      padding: 12px 16px 10px 16px;
      font-size: 12.5px;
      line-height: 1.35;
    }

    .photo-badge {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.8px;
      padding: 2px 7px;
      border-radius: 2px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    /* 4 Stat Badges */
    .stat-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .stat-card {
      background: #fff8f8;
      border: 1px solid #fecaca;
      border-left: 5px solid #dc2626;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 900;
      color: #dc2626;
      line-height: 1;
      white-space: nowrap;
    }

    .stat-desc {
      font-size: 12.5px;
      font-weight: 600;
      color: #374151;
      line-height: 1.3;
    }

    .stat-desc strong {
      color: #111827;
      font-weight: 800;
    }

    /* Column 2 & Column 3: Large Readable Editorial Text */
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
      margin-bottom: 13px;
    }

    .dateline {
      font-family: 'Inter', sans-serif;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.8px;
      color: #dc2626;
      text-transform: uppercase;
      display: block;
      margin-bottom: 8px;
    }

    .story-body strong {
      color: #0f172a;
      font-weight: 700;
    }

    /* Pull Quote Box */
    .quote-box {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17.5px;
      font-style: italic;
      font-weight: 700;
      line-height: 1.38;
      color: #991b1b;
      background: #fef2f2;
      border-top: 3px solid #dc2626;
      border-bottom: 3px solid #dc2626;
      border-radius: 4px;
      padding: 14px 18px;
      margin-top: 10px;
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

    /* Evidence callout in Col 2 */
    .evidence-summary-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      border-radius: 6px;
      padding: 11px 14px;
      margin-top: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      line-height: 1.45;
      color: #334155;
    }

    .evidence-summary-title {
      font-weight: 900;
      font-size: 11.5px;
      letter-spacing: 0.8px;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    /* Bottom Broadcast Bar */
    .footer-bar {
      border-top: 1.5px solid #0f172a;
      padding-top: 8px;
      margin-top: 10px;
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
        <div class="logo-wrap">
          <img src="${dtLogo}" alt="Dhaka Tribune Logo" />
        </div>
        <div class="masthead-divider"></div>
        <div class="desk-title">SPECIAL INVESTIGATION • SUNDARBANS WILDLIFE CRIME</div>
      </div>
      <div class="meta-tags">
        <strong>DHAKA TRIBUNE SPECIAL REPORT</strong><br>
        Published: Tuesday, September 29, 2026 • Khulna & Coast
      </div>
    </header>

    <!-- Headings: Bold and Large -->
    <section class="headline-container">
      <div class="category-badge">FOREST LAW ENFORCEMENT // ANNUAL CRACKDOWN</div>
      <h1 class="article-headline">824kg venison seized, 29 poachers held in Sundarbans in 2025</h1>
      <p class="article-subhead">During the period between January and December, Coast Guard has also seized more than 1,400 pieces of gewa and garan timber, two geckos, 62 turtles and 3,400 kilograms of polythene</p>
    </section>

    <!-- Main 3-Section Grid -->
    <main class="main-grid">
      <!-- Col 1: Photo & Stat Grid -->
      <aside class="left-panel">
        <div class="photo-card">
          <img src="${photoPoachersVenison}" alt="Coast Guard with captured poachers and venison haul" />
          <div class="photo-caption">
            <span class="photo-badge">SEIZED CONTRABAND & POACHERS</span><br>
            Coast Guard personnel at BCG Station Koyra with four arrested poachers, mounds of seized deer venison, deer heads, and heavy trap ropes inside the Sundarbans. Photo: Coast Guard
          </div>
        </div>

        <div class="stat-row-grid">
          <div class="stat-card">
            <div class="stat-number">824 KG</div>
            <div class="stat-desc">
              <strong>Venison Seized:</strong> Over 824kg deer meat and 600 lethal traps confiscated.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">29</div>
            <div class="stat-desc">
              <strong>Poachers Held:</strong> Arrested in joint anti-poaching operations in 2025.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">1,400+</div>
            <div class="stat-desc">
              <strong>Timber Logs:</strong> Gewa and garan wood seized alongside 62 rescued turtles.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">120 Cr</div>
            <div class="stat-desc">
              <strong>Metres of Nets:</strong> Illegal nets worth Tk 1,473 crore destroyed.
            </div>
          </div>
        </div>
      </aside>

      <!-- Col 2: High-Readability Editorial Story Part 1 -->
      <article class="story-col">
        <div class="story-body">
          <span class="dateline">KOYRA, KHULNA:</span>
          <p>
            Coast Guard West Zone has seized <strong>824 kilograms of deer meat</strong>, recovered <strong>600 traps</strong> and arrested <strong>29 poachers</strong> during aggressive wildlife and environmental protection drives across the Sundarbans in 2025.
          </p>
          <p>
            Between January and December, forces also confiscated over <strong>1,400 pieces of gewa and garan timber</strong>, two geckos, 62 wild turtles, and 3,400 kilograms of banned polythene.
          </p>
          <p>
            West Zone Commander <strong>Captain Mohammad Mesbaul Islam</strong> disclosed the comprehensive annual briefing at a press conference on December 29.
          </p>
        </div>

        <div class="evidence-summary-box">
          <div class="evidence-summary-title">🛡️ ANNUAL CRIME INTERCEPTIONS</div>
          • <strong>Arms & Pirates:</strong> 38 firearms, 2 grenades, 448 rounds seized; 49 pirates held.<br>
          • <strong>Hostages Rescued:</strong> 52 kidnapped fishermen and locals rescued safely.<br>
          • <strong>Fisheries Defense:</strong> Tk 120 cr shrimp fry & 14,000kg jelly shrimp intercepted.
        </div>
      </article>

      <!-- Col 3: High-Readability Editorial Story Part 2 & Official Statement -->
      <article class="story-col">
        <div class="story-body">
          <p>
            The authorities also seized over <strong>120 crore metres of illegal fishing nets</strong> valued at approximately Tk 1,473 crore, striking a massive blow against poaching syndicates.
          </p>
          <p>
            The Bangladesh Coast Guard continues to conduct joint coordinated operations alongside the Navy, Rapid Action Battalion, Police, and Forest Department to safeguard the world’s largest mangrove forest.
          </p>
        </div>

        <!-- Large Quote Box -->
        <div class="quote-box">
          "Through sustained operations in biodiversity conservation, suppression of piracy, and protection of fishermen, the Coast Guard remains fiercely committed to safeguarding the Sundarbans and eradicating deer poaching."
          <div class="quote-signoff">
            — Captain Mohammad Mesbaul Islam
            <div class="quote-designation">West Zone Commander, Bangladesh Coast Guard</div>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="footer-bar">
      <span>Dhaka Tribune Special Edition • Broadcast 16:9 Landscape Asset</span>
      <span>Bangladesh Coast Guard West Zone Annual Wildlife & Forest Briefing</span>
      <span>Ultra HD 4K / 1080p Video Ready</span>
    </footer>
  </div>
</body>
</html>`;

const tempHtmlPath = path.resolve('editnews/dhakatribiun/temp_dhaka_tribune_landscape.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const fileUrl = pathToFileURL(tempHtmlPath).href;
const outPng1080 = path.join(baseDir, 'dhaka_tribune_venison_seized_landscape_1080p.png');
const outPng4K = path.join(baseDir, 'dhaka_tribune_venison_seized_landscape_4k.png');

console.log('Rendering 1920x1080 Landscape PNG for Dhaka Tribune...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng1080}" --window-size=1920,1080 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

console.log('Rendering 3840x2160 (4K UHD) Landscape PNG for Dhaka Tribune...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng4K}" --window-size=1920,1080 --force-device-scale-factor=2 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

// Also mirror to project_assets/news
const projectAssetsDest = path.resolve('project_assets/news/dhaka_tribune_venison_seized_landscape_1080p.png');
fs.copyFileSync(outPng1080, projectAssetsDest);

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

console.log('Dhaka Tribune landscape pages generated successfully in 1080p and 4K!');
