import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const dolphinDir = path.resolve('editnews/dolphin');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBase64(fileName) {
  const filePath = path.join(dolphinDir, fileName);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading dolphin crisis assets...');
const tbsLogo = getBase64('Screenshot 2026-09-29 192820.png');
const photoDeadDolphin = getBase64('Screenshot 2026-09-29 192753.png');
const infographicCard = getBase64('Screenshot 2026-09-29 192805.png');

console.log('Assets loaded. Generating broadcast landscape editorial page...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Business Standard - The Death Traps of Abandoned Fishing Nets</title>
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
      padding: 20px 32px 18px 32px;
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
      gap: 18px;
    }

    .tbs-logo-crop {
      height: 54px;
      background: #06151a;
      border-radius: 4px;
      padding: 4px 14px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .tbs-logo-crop img {
      height: 42px;
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
      color: #0284c7;
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

    /* Headline Section with BOLD and LARGE Title */
    .headline-container {
      margin-bottom: 18px;
    }

    .category-badge {
      display: inline-block;
      background: #b91c1c;
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
      font-size: 50px;
      font-weight: 900;
      line-height: 1.14;
      color: #090e17;
      letter-spacing: -0.6px;
      margin-bottom: 8px;
    }

    .article-subhead {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 21px;
      font-style: italic;
      color: #334155;
      line-height: 1.38;
      font-weight: 400;
      max-width: 1750px;
    }

    /* Main 3-Column Grid */
    .main-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 550px 470px 1fr;
      gap: 28px;
      overflow: hidden;
    }

    /* Column 1: Infographic Card */
    .infographic-col {
      display: flex;
      flex-direction: column;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
    }

    .infographic-header {
      background: #0284c7;
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-transform: uppercase;
    }

    .infographic-image-wrap {
      flex: 1;
      overflow: hidden;
      background: #e0f2fe;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .infographic-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* Column 2: Photo Evidence & Quick Crisis Metrics */
    .photo-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .photo-card {
      position: relative;
      height: 290px;
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
      padding: 10px 14px 8px 14px;
      font-size: 12px;
      line-height: 1.35;
    }

    .photo-badge {
      display: inline-block;
      background: #b91c1c;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 2px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* Fast Fact Stat Cards */
    .stat-cards-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
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
      gap: 16px;
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 34px;
      font-weight: 900;
      color: #b91c1c;
      line-height: 1;
      white-space: nowrap;
    }

    .stat-desc {
      font-size: 13.5px;
      font-weight: 600;
      color: #374151;
      line-height: 1.35;
    }

    .stat-desc strong {
      color: #111827;
      font-weight: 800;
    }

    /* Column 3: Organized High-Readability Editorial Text */
    .story-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-left: 4px;
    }

    .story-body {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 18px;
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
      font-size: 14px;
      letter-spacing: 0.8px;
      color: #b91c1c;
      text-transform: uppercase;
      display: block;
      margin-bottom: 8px;
    }

    .story-body strong {
      color: #0f172a;
      font-weight: 700;
    }

    /* Large Quote Box */
    .quote-box {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-style: italic;
      font-weight: 700;
      line-height: 1.38;
      color: #991b1b;
      background: #fef2f2;
      border-top: 3px solid #dc2626;
      border-bottom: 3px solid #dc2626;
      border-radius: 4px;
      padding: 14px 18px;
      margin-top: 8px;
    }

    .quote-signoff {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 800;
      font-style: normal;
      color: #1e293b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quote-designation {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      text-transform: none;
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
        <div class="tbs-logo-crop">
          <img src="${tbsLogo}" alt="The Business Standard Logo" />
        </div>
        <div class="masthead-divider"></div>
        <div class="desk-title">SPECIAL INVESTIGATION • MARINE & RIVERINE BIODIVERSITY</div>
      </div>
      <div class="meta-tags">
        <strong>THE BUSINESS STANDARD SPECIAL REPORT</strong><br>
        Published: Tuesday, September 29, 2026 • Bay of Bengal & Coast
      </div>
    </header>

    <!-- Headings: Bold and Large -->
    <section class="headline-container">
      <div class="category-badge">ECOLOGICAL EMERGENCY // GHOST FISHING NETS</div>
      <h1 class="article-headline">The death traps of abandoned fishing nets</h1>
      <p class="article-subhead">According to Wildlife Conservation Society, fishing nets are responsible for 65% of the deaths of whales and dolphins on our shores</p>
    </section>

    <!-- Main 3-Column Section -->
    <main class="main-grid">
      <!-- Col 1: Infographic -->
      <aside class="infographic-col">
        <div class="infographic-header">
          <span>Official Visual Data</span>
          <span>TBS INFOGRAPHIC</span>
        </div>
        <div class="infographic-image-wrap">
          <img src="${infographicCard}" alt="TBS Dolphins Woes Infographic" />
        </div>
      </aside>

      <!-- Col 2: Photo & Fast Fact Badges -->
      <section class="photo-col">
        <div class="photo-card">
          <img src="${photoDeadDolphin}" alt="Dead dolphin washed ashore at Kuakata" />
          <div class="photo-caption">
            <span class="photo-badge">CASUALTY OF ABANDONED NETS</span><br>
            A dead dolphin washes up on the coast. In just two months, at least 23 dolphins perished entangled in fishing gear across Bangladesh. Photo: TBS
          </div>
        </div>

        <div class="stat-cards-wrap">
          <div class="stat-card">
            <div class="stat-number">65%</div>
            <div class="stat-desc">
              <strong>Shoreline Mortality:</strong> Ghost nets cause 65% of all dolphin and whale deaths in Bangladesh.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">23</div>
            <div class="stat-desc">
              <strong>Dead in 60 Days:</strong> 13 dolphins died in August and 10 in July alone — all trapped in abandoned nets.
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-number">250+</div>
            <div class="stat-desc">
              <strong>Documented Deaths:</strong> Marine mammals found dead in country waters since 2008 (WCS records).
            </div>
          </div>
        </div>
      </section>

      <!-- Col 3: High-Readability Editorial Story -->
      <article class="story-col">
        <div class="story-body">
          <span class="dateline">CHATTOGRAM & COASTAL BELT:</span>
          <p>
            The Halda River Research Laboratory recovered a dolphin trapped in a fishing net from the River Karnaphuli. An autopsy confirmed it <strong>died of suffocation</strong> as its mouth was tangled underwater.
          </p>
          <p>
            In Patuakhali's Kuakata and along coastal estuaries, <strong>13 dead dolphins were found in August and 10 in July</strong> — every single one entangled in discarded fishing nets.
          </p>
          <p>
            Researchers warn that fishermen abandon massive quantities of gear out of negligence. These <strong>"ghost nets"</strong> become lethal perpetual traps for dolphins, sharks, whales, and sea turtles across the Bay of Bengal.
          </p>
          <p>
            According to the <strong>Wildlife Conservation Society (WCS)</strong>, over 250 marine mammals have perished in Bangladesh waters, with ghost nets now inflicting unprecedented destruction.
          </p>
        </div>

        <!-- Quote Box -->
        <div class="quote-box">
          "The number of dolphins dying from abandoned nets is higher than any other animal. These nets cause 65% of whale and dolphin deaths on our shores. It is tragic that we may never know the full count because no government agency keeps a full registry."
          <div class="quote-signoff">
            — Dr Muhammad Zahangir Alom
            <div class="quote-designation">Country Representative, Wildlife Conservation Society (WCS)</div>
          </div>
        </div>
      </article>
    </main>

    <!-- Footer -->
    <footer class="footer-bar">
      <span>The Business Standard Special Edition • Broadcast 16:9 Landscape Asset</span>
      <span>Wildlife Conservation Society (WCS) & Chattogram University Research</span>
      <span>Ultra HD 4K / 1080p Video Ready</span>
    </footer>
  </div>
</body>
</html>`;

const tempHtmlPath = path.resolve('editnews/dolphin/temp_dolphin_landscape.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

const fileUrl = pathToFileURL(tempHtmlPath).href;
const outPng1080 = path.join(dolphinDir, 'tbs_dolphin_crisis_landscape_1080p.png');
const outPng4K = path.join(dolphinDir, 'tbs_dolphin_crisis_landscape_4k.png');

console.log('Rendering 1920x1080 Landscape PNG for Dolphin News...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng1080}" --window-size=1920,1080 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

console.log('Rendering 3840x2160 (4K UHD) Landscape PNG for Dolphin News...');
execSync(`"${chromePath}" --headless=new --screenshot="${outPng4K}" --window-size=1920,1080 --force-device-scale-factor=2 --hide-scrollbars "${fileUrl}"`, { stdio: 'inherit' });

// Also mirror to project_assets/news for video editing convenience
const projectAssetsDest = path.resolve('project_assets/news/tbs_dolphin_crisis_landscape_1080p.png');
fs.copyFileSync(outPng1080, projectAssetsDest);

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

console.log('Dolphin landscape pages generated successfully in 1080p and 4K!');
