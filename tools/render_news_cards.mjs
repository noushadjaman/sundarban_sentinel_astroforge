import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('project_assets/news');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert image file to base64 data URL for instant, reliable rendering in headless Chrome
function getBase64DataUrl(filePath) {
  const absPath = path.resolve(filePath);
  const ext = path.extname(absPath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(absPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading image data for cards...');
const poisonImg = getBase64DataUrl('tools/assets/poison_fishing_boat.jpg');
const netsImg = getBase64DataUrl('dataset/current_jal/current_jal_02.jpg');
const dolphinImg = getBase64DataUrl('project_assets/news/wildlife_ganges_dolphin_hd.jpg');
const tigerImg = getBase64DataUrl('project_assets/news/wildlife_bengal_tiger_creek_hd.jpg');
const patrolImg = getBase64DataUrl('tools/assets/patrol_boat.jpg');

const articles = [
  {
    filename: '01_poison_fishing_crisis.png',
    publisher: 'THE BUSINESS STANDARD',
    publisherColor: '#e53935',
    publisherBadge: 'TBS NEWS',
    category: 'ENVIRONMENT // SUNDARBANS SPECIAL REPORT',
    headline: 'Drop of poison, sea of consequences: How poison fishing is wiping out Sundarbans ecosystems',
    subhead: 'Syndicates pour toxic agricultural chemicals into tidal canals to force instant fish harvests, destroying aquatic food chains and threatening UNESCO World Heritage mangroves.',
    byline: 'By Anonno Afroz & Udita Rashid',
    date: 'June 27, 2025 • Verified Editorial',
    image: poisonImg,
    caption: 'Local fishing boats navigating poisoned creek network inside Sundarbans mangrove reserve.',
    accentTag: 'CHEMICAL ENCROACHMENT',
    tagColor: '#ff1744'
  },
  {
    filename: '02_illegal_nets_and_traps.png',
    publisher: 'DHAKA TRIBUNE',
    publisherColor: '#d32f2f',
    publisherBadge: 'DHAKA TRIBUNE',
    category: 'WILDLIFE CRIME // ILLICIT GEAR SWEEPS',
    headline: 'Over 600 deer traps recovered from Sundarbans; poachers remain out of reach',
    subhead: 'Forest Department sweeps across Chandpai and Sharankhola ranges seize thousands of meters of nylon wire snares and banned monofilament current nets hidden in mangrove creeks.',
    byline: 'Dhaka Tribune Environment Desk',
    date: 'May 14, 2024 • Frontline Report',
    image: netsImg,
    caption: 'Confiscated nylon monofilament current nets and lethal wire deer snares laid out at forest post.',
    accentTag: 'BANNED GEAR & TRAPS',
    tagColor: '#ff9100'
  },
  {
    filename: '03_ganges_dolphin_mortality.png',
    publisher: 'THE DAILY STAR',
    publisherColor: '#1565c0',
    publisherBadge: 'THE DAILY STAR',
    category: 'ENDANGERED AQUATIC FAUNA // HABITAT CRISIS',
    headline: 'Entangled to Death: Ganges river dolphins falling prey to illegal current nets in Sundarbans',
    subhead: 'Over 100 endangered river dolphins lost in a decade; conservationists demand immediate real-time enforcement against monofilament gillnets within protected river sanctuaries.',
    byline: 'By Environment Correspondent',
    date: 'October 18, 2024 • Wildlife Investigation',
    image: dolphinImg,
    caption: 'Endangered Ganges River Dolphin (Platanista gangetica) surfacing in vulnerable estuarine waters.',
    accentTag: 'CRITICAL HABITAT DECLINE',
    tagColor: '#00e5ff'
  },
  {
    filename: '04_tiger_poaching_canopy_loss.png',
    publisher: 'DHAKA TRIBUNE',
    publisherColor: '#d32f2f',
    publisherBadge: 'DHAKA TRIBUNE',
    category: 'MANGROVE INTEGRITY // APEX PREDATOR THREAT',
    headline: 'Tiger carcass found floating in Sundarbans canal as mangrove forest canopy shrinks',
    subhead: 'Recovery of adult Royal Bengal Tiger in Sharankhola range triggers autopsy probe amidst rising habitat fragmentation and illicit poacher traps along tidal waterways.',
    byline: 'Staff Correspondent, Khulna Bureau',
    date: 'February 13, 2024 • Forest Watch',
    image: tigerImg,
    caption: 'Royal Bengal Tiger patrolling tidal mudflats in the core Sundarban mangrove canopy.',
    accentTag: 'POACHING & DEFORESTATION',
    tagColor: '#ff5252'
  },
  {
    filename: '05_ranger_zero_connectivity.png',
    publisher: 'MONGABAY',
    publisherColor: '#2e7d32',
    publisherBadge: 'MONGABAY NEWS',
    category: 'FRONTLINE ENFORCEMENT // FIELD REALITY',
    headline: 'Outgunned and disconnected: Sundarbans rangers battle armed poachers with zero cell coverage',
    subhead: 'Forest guards navigate thousands of miles of blind tidal creeks without telecommunications or real-time radar, relying on offline tools and manual patrols to defend wildlife.',
    byline: 'Mongabay Environmental In-Depth Dispatch',
    date: 'January 22, 2025 • Special Dispatch',
    image: patrolImg,
    caption: 'Armed forest department rangers navigating remote mangrove creeks during anti-poaching patrol.',
    accentTag: 'ZERO-CONNECTIVITY BARRIER',
    tagColor: '#00e676'
  }
];

function generateHtml(article) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${article.headline}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,700;0,6..72,800;1,6..72,400&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: radial-gradient(circle at 75% 25%, #14281f 0%, #08110c 60%, #040806 100%);
      color: #ffffff;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Ambient Tech Grid & Vignette */
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 1;
    }

    /* Top Broadcast Masthead Bar */
    .top-bar {
      position: relative;
      z-index: 10;
      height: 90px;
      padding: 0 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.10);
      background: rgba(8, 17, 12, 0.85);
      backdrop-filter: blur(12px);
    }

    .source-branding {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .publisher-badge {
      background: ${article.publisherColor};
      color: #ffffff;
      padding: 8px 18px;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 2px;
      border-radius: 6px;
      box-shadow: 0 4px 16px ${article.publisherColor}55;
    }

    .publisher-name {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #ffffff;
    }

    .broadcast-telemetry {
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: 13px;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }

    .record-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ff1744;
      box-shadow: 0 0 12px #ff1744;
      display: inline-block;
      margin-right: 8px;
    }

    /* Main Editorial Card Layout */
    .main-container {
      position: relative;
      z-index: 10;
      flex: 1;
      padding: 50px 80px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 60px;
      align-items: center;
    }

    /* Left: Editorial Headline Card */
    .article-content {
      background: rgba(14, 27, 20, 0.70);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-left: 6px solid ${article.publisherColor};
      border-radius: 20px;
      padding: 48px;
      box-shadow: 
        0 24px 48px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
    }

    .tag-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
    }

    .category-pill {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .accent-badge {
      background: ${article.tagColor}22;
      color: ${article.tagColor};
      border: 1px solid ${article.tagColor}66;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
    }

    .article-headline {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 44px;
      font-weight: 800;
      line-height: 1.22;
      color: #ffffff;
      margin-bottom: 24px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .article-subhead {
      font-size: 18px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.80);
      margin-bottom: 32px;
      font-weight: 400;
    }

    .metadata-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.10);
      padding-top: 20px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
    }

    .byline {
      font-weight: 700;
      color: #00e676;
      letter-spacing: 0.5px;
    }

    .date {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Right: Featured Photo Frame */
    .photo-container {
      position: relative;
      height: 600px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 24px 60px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.15);
      background: #000;
      display: flex;
      flex-direction: column;
    }

    .photo-frame {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: contrast(1.08) brightness(0.95);
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(5, 12, 8, 0.95) 0%, rgba(5, 12, 8, 0.2) 40%, transparent 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 30px;
    }

    .photo-badge {
      align-self: flex-start;
      background: rgba(0, 0, 0, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #00e5ff;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .photo-caption {
      font-size: 13px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.85);
      font-style: italic;
    }

    /* Bottom Broadcast Ticker Bar */
    .bottom-ticker {
      position: relative;
      z-index: 10;
      height: 60px;
      background: #060d09;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 80px;
      justify-content: space-between;
      font-size: 12px;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.50);
    }

    .ticker-highlight {
      color: #00e676;
    }
  </style>
</head>
<body>
  <!-- Top Broadcast Bar -->
  <header class="top-bar">
    <div class="source-branding">
      <div class="publisher-badge">${article.publisherBadge}</div>
      <div class="publisher-name">${article.publisher}</div>
    </div>
    <div class="broadcast-telemetry">
      <div><span class="record-dot"></span>SUNDARBAN SENTINEL INTEL</div>
      <div>ECOLOGICAL CRISIS ARCHIVE</div>
      <div style="color: #00e5ff;">1080P PRO RES CLIP</div>
    </div>
  </header>

  <!-- Main Editorial Content -->
  <main class="main-container">
    <section class="article-content">
      <div class="tag-row">
        <div class="category-pill">${article.category}</div>
        <div class="accent-badge">${article.accentTag}</div>
      </div>
      <h1 class="article-headline">${article.headline}</h1>
      <p class="article-subhead">${article.subhead}</p>
      <div class="metadata-footer">
        <div class="byline">${article.byline}</div>
        <div class="date">${article.date}</div>
      </div>
    </section>

    <!-- Right Featured Imagery -->
    <div class="photo-container">
      <img class="photo-frame" src="${article.image}" alt="Article Photo" />
      <div class="photo-overlay">
        <div class="photo-badge">EVIDENCE ARCHIVE</div>
        <p class="photo-caption">${article.caption}</p>
      </div>
    </div>
  </main>

  <!-- Bottom Broadcast Footer -->
  <footer class="bottom-ticker">
    <div>SUNDARBAN SENTINEL // PART 2: ECOLOGICAL CRISIS & BIODIVERSITY THREAT</div>
    <div class="ticker-highlight">CONFIDENTIAL BROADCAST COMPOSITING CARD // 1920x1080</div>
    <div>SOURCE: VERIFIED EDITORIAL PRESS</div>
  </footer>
</body>
</html>`;
}

async function renderAll() {
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const outPng = path.join(outputDir, article.filename);
    const tempHtml = path.resolve(`temp_card_${i}.html`);

    console.log(`[${i+1}/${articles.length}] Generating HTML for: ${article.filename}...`);
    const htmlContent = generateHtml(article);
    fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

    const fileUrl = pathToFileURL(tempHtml).href;
    console.log(`Rendering 1080p screenshot to ${article.filename}...`);

    try {
      execSync(`"${chromePath}" --headless=new --screenshot="${outPng}" --window-size=1920,1080 --hide-scrollbars "${fileUrl}"`, {
        stdio: 'inherit'
      });
      const stat = fs.statSync(outPng);
      console.log(`✓ Saved ${article.filename} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ Error rendering ${article.filename}:`, err.message);
    } finally {
      if (fs.existsSync(tempHtml)) {
        fs.unlinkSync(tempHtml);
      }
    }
  }
}

renderAll().then(() => {
  console.log('All 5 news cards successfully rendered to ./project_assets/news/');
});
