import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('project_assets/hackathon_slides');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function getBase64(filePath) {
  const abs = path.resolve(filePath);
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(abs).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading high-resolution assets for Hack For Humanity...');
const astroLogo = getBase64('project_assets/astroforge_badge_sq.png');
const gpLogo = getBase64('project_assets/Grameenphone_logo_PNG1.png');

// App Screenshots
const ssHome1 = getBase64('screenshots/home1.png');
const ssOffline = getBase64('screenshots/offlinemode.png');
const ssTiger = getBase64('screenshots/raretiger.png');
const ssDeer = getBase64('screenshots/deer.png');
const ssNet = getBase64('screenshots/riskynetdetectoffline.png');
const ssReport1 = getBase64('screenshots/report1.png');
const ssRiskArea = getBase64('screenshots/riskarea1.png');
const ssDeforest = getBase64('screenshots/deforestrationzonw1.png');
const ssHome2 = getBase64('screenshots/home2.png');
const ssReport2 = getBase64('screenshots/report2.png');

// News Screenshots
const newsPoison = getBase64('project_assets/news/01_poison_fishing_crisis.png');
const newsTiger = getBase64('project_assets/news/04_tiger_poaching_canopy_loss.png');
const newsNets = getBase64('project_assets/news/02_illegal_nets_and_traps.png');
const newsRanger = getBase64('project_assets/news/05_ranger_zero_connectivity.png');

function buildLightSlide(opts) {
  const {
    topicNumber,
    topicTag,
    title,
    subtitle,
    contentHtml,
    phone1Img,
    phone1Label,
    phone1Badge,
    phone1Pins = [],
    phone2Img,
    phone2Label,
    phone2Badge,
    phone2Pins = []
  } = opts;

  const renderPins = (pins) => {
    return pins.map(p => `
      <div class="callout-pin ${p.color || 'pin-blue'}" style="top: ${p.top}; left: ${p.left};">
        <div class="pin-num">${p.num}</div>
        <span>${p.label}</span>
      </div>
      <div class="pin-anchor ${p.color || 'pin-blue'}" style="top: ${p.anchorTop || p.top}; left: ${p.anchorLeft || p.left};"></div>
    `).join('\n');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800&family=Hind+Siliguri:wght@600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #f8fafc;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: relative;
    }

    .bg-canvas {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #f8fafc;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.04) 0%, transparent 40%),
        linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    }

    .top-header {
      position: absolute;
      top: 22px; left: 48px; right: 48px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      z-index: 20;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .astro-logo-img {
      height: 48px;
      width: 48px;
      border-radius: 10px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .header-divider {
      width: 2px;
      height: 32px;
      background: #cbd5e1;
    }

    .brand-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #0284c7;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .topic-pill-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topic-number-pill {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .topic-name-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .main-content {
      position: absolute;
      top: 106px; left: 48px; right: 48px; bottom: 68px;
      display: grid;
      grid-template-columns: 960px 816px;
      gap: 48px;
      align-items: stretch;
      z-index: 20;
    }

    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px 34px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .topic-tag-badge {
      display: inline-block;
      padding: 5px 14px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .tag-blue { background: #e0f2fe; color: #0284c7; }
    .tag-emerald { background: #d1fae5; color: #059669; }
    .tag-red { background: #fee2e2; color: #dc2626; }
    .tag-amber { background: #fef3c7; color: #b45309; }
    .tag-cyan { background: #e0f7fa; color: #0077b6; }
    .tag-purple { background: #f3e8ff; color: #7e22ce; }

    .slide-heading {
      font-size: 33px;
      font-weight: 800;
      line-height: 1.18;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .slide-subheading {
      font-size: 15.5px;
      line-height: 1.45;
      color: #475569;
      margin-bottom: 14px;
      font-weight: 500;
    }

    .screenshots-showcase {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 30px;
    }

    .phone-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 375px;
      position: relative;
    }

    .phone-mockup {
      width: 375px;
      height: 775px;
      background: #ffffff;
      border-radius: 42px;
      border: 4.5px solid #0f172a;
      padding: 8px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .phone-speaker-slit {
      width: 68px;
      height: 4.5px;
      background: #cbd5e1;
      border-radius: 3px;
      margin: 4px auto 7px auto;
    }

    .phone-screen-frame {
      flex: 1;
      border-radius: 30px;
      overflow: hidden;
      background: #000000;
      position: relative;
    }

    .phone-screen-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .phone-caption-badge {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .caption-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .caption-pill {
      font-size: 11px;
      font-weight: 700;
      color: #0284c7;
      background: #e0f2fe;
      padding: 2px 10px;
      border-radius: 12px;
    }

    .callout-pin {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.94);
      border: 1.5px solid #ffffff;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      color: #ffffff;
      padding: 4px 10px 4px 6px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.2px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 50;
      transform: translate(-50%, -50%);
    }

    .pin-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 900;
      color: #ffffff;
    }

    .pin-blue .pin-num { background: #0284c7; }
    .pin-green .pin-num { background: #059669; }
    .pin-red .pin-num { background: #dc2626; }
    .pin-amber .pin-num { background: #d97706; }
    .pin-cyan .pin-num { background: #0077b6; }
    .pin-purple .pin-num { background: #7c3aed; }

    .pin-anchor {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #0f172a;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
      z-index: 49;
      transform: translate(-50%, -50%);
    }
    .pin-anchor.pin-blue { border-color: #0284c7; }
    .pin-anchor.pin-green { border-color: #059669; }
    .pin-anchor.pin-red { border-color: #dc2626; }
    .pin-anchor.pin-amber { border-color: #d97706; }
    .pin-anchor.pin-cyan { border-color: #0077b6; }
    .pin-anchor.pin-purple { border-color: #7c3aed; }

    .bottom-bar {
      position: absolute;
      bottom: 14px; left: 48px; right: 48px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid #e2e8f0;
      padding-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      z-index: 20;
    }

    .progress-dots {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #cbd5e1;
    }

    .dot.active {
      width: 28px;
      border-radius: 5px;
      background: #0284c7;
    }
  </style>
</head>
<body>
  <div class="bg-canvas"></div>

  <!-- Top Header -->
  <div class="top-header">
    <div class="brand-section">
      <img src="${astroLogo}" class="astro-logo-img" alt="AstroForge Logo">
      <div class="header-divider"></div>
      <div>
        <div class="brand-title">Sundarban Sentinel • Hack For Humanity</div>
        <div class="brand-subtitle">Team AstroForge • Md Nushad Jaman Raj, Tanjid Hossen Rifat, Raf Rafin Mahmud</div>
      </div>
    </div>
    <div class="topic-pill-wrap">
      <span class="topic-number-pill">TOPIC 0${topicNumber} / 05</span>
      <span class="topic-name-pill">${topicTag}</span>
    </div>
  </div>

  <!-- Main Grid Content -->
  <div class="main-content">
    <div class="info-card">
      <div>
        <div class="topic-tag-badge ${opts.tagClass || 'tag-blue'}">${opts.tagLabel}</div>
        <h1 class="slide-heading">${title}</h1>
        <p class="slide-subheading">${subtitle}</p>
        ${contentHtml}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #64748b;">
        <span><strong>COMMUNITY STAKEHOLDERS:</strong> General Fishermen • Honey Collectors • Hunters • Rangers</span>
        <span style="color: #0f172a; font-weight: 700;">100% Native Production Implementation</span>
      </div>
    </div>

    <!-- Right Screenshots Dual-Phone Showcase -->
    <div class="screenshots-showcase">
      <!-- Phone 1 -->
      <div class="phone-container">
        <div class="phone-mockup">
          <div class="phone-speaker-slit"></div>
          <div class="phone-screen-frame">
            <img src="${phone1Img}" alt="App Screenshot 1">
            ${renderPins(phone1Pins)}
          </div>
        </div>
        <div class="phone-caption-badge">
          <span class="caption-title">${phone1Label}</span>
          <span class="caption-pill">${phone1Badge}</span>
        </div>
      </div>

      <!-- Phone 2 -->
      <div class="phone-container">
        <div class="phone-mockup">
          <div class="phone-speaker-slit"></div>
          <div class="phone-screen-frame">
            <img src="${phone2Img}" alt="App Screenshot 2">
            ${renderPins(phone2Pins)}
          </div>
        </div>
        <div class="phone-caption-badge">
          <span class="caption-title">${phone2Label}</span>
          <span class="caption-pill">${phone2Badge}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="bottom-bar">
    <span>Sundarban Sentinel • Offline Edge-AI Conservation Terminal</span>
    <div class="progress-dots">
      <div class="dot ${topicNumber === 1 ? 'active' : ''}"></div>
      <div class="dot ${topicNumber === 2 ? 'active' : ''}"></div>
      <div class="dot ${topicNumber === 3 ? 'active' : ''}"></div>
      <div class="dot ${topicNumber === 4 ? 'active' : ''}"></div>
      <div class="dot ${topicNumber === 5 ? 'active' : ''}"></div>
    </div>
    <span>Hack For Humanity 2026 • Team AstroForge</span>
  </div>
</body>
</html>`;
}

// 5 Selected App Preview Topics
const topics = [
  // TOPIC 1: Offline Terminal
  {
    topicNumber: 1,
    name: 'slide_topic_1_offline_terminal',
    topicTag: 'Offline Resilience',
    tagClass: 'tag-blue',
    tagLabel: 'Topic 1: 100% Offline Deep-Mangrove Operation',
    title: 'Zero Cellular Coverage:<br><span style="color:#0284c7;">Autonomous Terminal Mode</span>',
    subtitle: 'Deep inside the 10,000 km² tidal mangrove labyrinth, mobile networks do not exist. Sundarban Sentinel operates with zero cloud dependency.',
    phone1Img: ssHome1,
    phone1Label: 'FIG 1.1: Sentinel Terminal Dashboard',
    phone1Badge: 'Offline Status & Core Navigation',
    phone1Pins: [
      { num: '1', label: 'Pre-Cached NASA Anomaly Layer', color: 'pin-blue', top: '16%', left: '50%', anchorTop: '18%', anchorLeft: '32%' },
      { num: '2', label: 'Offline GPS River Tracker', color: 'pin-green', top: '48%', left: '50%', anchorTop: '46%', anchorLeft: '48%' }
    ],
    phone2Img: ssOffline,
    phone2Label: 'FIG 1.2: 100% Offline Diagnostics',
    phone2Badge: 'Local Model & SQLite Memory Active',
    phone2Pins: [
      { num: '3', label: 'On-Device INT8 YOLOv8 Model', color: 'pin-blue', top: '42%', left: '52%', anchorTop: '42%', anchorLeft: '22%' },
      { num: '4', label: 'Zero-Data-Loss SQLite Vault', color: 'pin-green', top: '51%', left: '52%', anchorTop: '51%', anchorLeft: '22%' },
      { num: '5', label: 'Auto Cloud Sync On Reconnect', color: 'pin-amber', top: '60%', left: '52%', anchorTop: '60%', anchorLeft: '22%' },
      { num: '6', label: 'Autonomous Offline Patrol Mode', color: 'pin-green', top: '67%', left: '50%', anchorTop: '67%', anchorLeft: '50%' }
    ],
    contentHtml: `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #0284c7; letter-spacing: 1px; display: block; margin-bottom: 6px;">
          MARKED APP FUNCTIONS & ARCHITECTURE:
        </span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div><strong style="color:#0f172a;">① Cached Satellite Layer:</strong> Pre-loaded NASA anomaly maps active with 0 bars signal.</div>
          <div><strong style="color:#0f172a;">② Offline GPS Tracking:</strong> Real-time river coordinate lock without cell tower triangulation.</div>
          <div><strong style="color:#0f172a;">③ On-Device INT8 Model:</strong> Neural weights stored locally on device flash memory.</div>
          <div><strong style="color:#0f172a;">④ SQLite Incident Vault:</strong> Cryptographically buffers incident dossiers until network return.</div>
        </div>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #0284c7; letter-spacing: 1px; display: block; margin-bottom: 3px;">OPERATIONAL WORKFLOW INSIDE TIDAL CHANNELS:</span>
        <p style="font-size: 12.5px; color: #1e293b; line-height: 1.45;">
          Patrol rangers and honey collectors navigate winding rivers for up to <strong>14 days without network signal</strong>. Sundarban Sentinel guarantees uninterrupted mission readiness—performing species verification, illegal net tracking, and evidence logging completely offline.
        </p>
      </div>

      <div style="display: flex; gap: 10px;">
        <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ 0 BARS CELLULAR REQUIRED</span>
        <span style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ INSTANT COLD-BOOT (450ms)</span>
        <span style="background: #faf5ff; border: 1px solid #e9d5ff; color: #6b21a8; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ OFFLINE GPS LOCK</span>
      </div>
    `
  },

  // TOPIC 2: Hunters & Wildlife AI
  {
    topicNumber: 2,
    name: 'slide_topic_2_edge_ai_species',
    topicTag: 'Hunters & Wildlife AI',
    tagClass: 'tag-emerald',
    tagLabel: 'Topic 2: For Professional Hunters — Species Legal Guidance',
    title: 'Which Animals Can Be Hunted?<br><span style="color:#059669;">Instant AI Legal Verification</span>',
    subtitle: 'Professional trackers, honey collectors (Mawalis), and hunters point the camera at any animal to immediately verify whether it is legally prohibited or permitted.',
    phone1Img: ssTiger,
    phone1Label: 'FIG 2.1: Royal Bengal Tiger Detection',
    phone1Badge: 'STRICTLY PROHIBITED • Schedule-I Alert',
    phone1Pins: [
      { num: '1', label: '353ms Real-Time Camera Scan', color: 'pin-blue', top: '22%', left: '50%', anchorTop: '25%', anchorLeft: '32%' },
      { num: '2', label: '🚫 PROHIBITED: Tiger (94.0%)', color: 'pin-red', top: '34%', left: '50%', anchorTop: '36%', anchorLeft: '65%' },
      { num: '3', label: 'Auto-Mapped Wildlife Act 2012', color: 'pin-emerald', top: '65%', left: '50%', anchorTop: '67%', anchorLeft: '30%' },
      { num: '4', label: 'Non-Bailable: 2-7 Yrs Jail Penalty', color: 'pin-red', top: '76%', left: '50%', anchorTop: '76%', anchorLeft: '22%' }
    ],
    phone2Img: ssDeer,
    phone2Label: 'FIG 2.2: Spotted Deer (Chital) Detection',
    phone2Badge: 'Axis axis • Schedule-I Protection',
    phone2Pins: [
      { num: '5', label: '🚫 PROHIBITED: Chital Deer (92%)', color: 'pin-red', top: '32%', left: '50%', anchorTop: '34%', anchorLeft: '50%' },
      { num: '6', label: 'Schedule-I Protection Warning', color: 'pin-amber', top: '58%', left: '50%', anchorTop: '58%', anchorLeft: '35%' },
      { num: '7', label: '1 to 10 Lakh Taka Fine Alert', color: 'pin-red', top: '70%', left: '50%', anchorTop: '71%', anchorLeft: '35%' }
    ],
    contentHtml: `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #059669; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 10.5px; font-weight: 800; color: #047857; letter-spacing: 1px; display: block; margin-bottom: 4px;">
          PITCH VOICEOVER SCRIPT (HACK FOR HUMANITY):
        </span>
        <p style="font-size: 13px; line-height: 1.45; color: #0f172a; font-weight: 500;">
          "Introducing <strong>Sundarban Sentinel</strong>: an offline edge-AI conservation terminal. Powered by a <strong>custom quantized YOLOv8 neural network</strong>, our mobile engine operates entirely on-device with zero cloud reliance. Rangers and hunters simply point their phone to detect protected wildlife in milliseconds. Instantly, our decoupled statutory engine maps the detection to the <strong>Bangladesh Wildlife Conservation Act 2012</strong> — generating court-admissible evidence cards with exact legal sections, non-bailable status, and GPS coordinates."
        </p>
      </div>

      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #b91c1c; letter-spacing: 0.8px; display: block; margin-bottom: 4px;">
          🎯 HOW THE IMAGE DETECTING MODEL GUIDES HUNTERS:
        </span>
        <ul style="font-size: 12px; color: #334155; line-height: 1.45; padding-left: 18px; margin: 0;">
          <li><strong>Prevents Accidental Hunting:</strong> Distinguishes protected Schedule-I species (Royal Bengal Tiger, Chital Deer, Dolphins, Adjutants) from non-restricted local fauna.</li>
          <li><strong>Instant Statutory Warning:</strong> Shows explicit Bengali law cards (Sec 36) stating up to <strong>7 years rigorous imprisonment & 10 lakh taka fines</strong> before any arrow, trap, or shot is fired.</li>
          <li><strong>Educates Traditional Communities:</strong> Protects honey harvesters from syndicate entrapment by proving animals are non-bailable court offenses.</li>
        </ul>
      </div>

      <div style="display: flex; gap: 8px;">
        <span style="background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">🚫 TIGER (PROTECTED)</span>
        <span style="background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">🚫 DEER (PROTECTED)</span>
        <span style="background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">⚡ 353ms EDGE NPU SCAN</span>
      </div>
    `
  },

  // TOPIC 3: General People & Fishermen
  {
    topicNumber: 3,
    name: 'slide_topic_3_general_people_usecase',
    topicTag: 'Community Empowerment',
    tagClass: 'tag-purple',
    tagLabel: 'Topic 3: For General People & Fishermen — Net Checks & Citizen Reporting',
    title: 'How General People Use the App:<br><span style="color:#7e22ce;">Legal Net Checks & Animal Rescue</span>',
    subtitle: 'Coastal villagers and fishermen use the app to verify fishing nets, avoid illegal species, learn environmental laws, and report deforestation or animals at risk.',
    phone1Img: ssNet,
    phone1Label: 'FIG 3.1: Pre-Fishing Net Check (Offline)',
    phone1Badge: 'Fishermen Self-Check • Current Jal Alert',
    phone1Pins: [
      { num: '1', label: '🔍 Check Net: Prohibited Current Jal', color: 'pin-red', top: '28%', left: '50%', anchorTop: '32%', anchorLeft: '65%' },
      { num: '2', label: '📜 Awareness of Fisheries Law 1950', color: 'pin-amber', top: '65%', left: '50%', anchorTop: '67%', anchorLeft: '32%' },
      { num: '3', label: '🐬 Avoid Catching Dolphins & Turtles', color: 'pin-blue', top: '73%', left: '50%', anchorTop: '73%', anchorLeft: '32%' }
    ],
    phone2Img: ssReport1,
    phone2Label: 'FIG 3.2: Citizen Community Report',
    phone2Badge: 'Deforestation & Animal-at-Risk Desk',
    phone2Pins: [
      { num: '4', label: '📸 Camera Ready: Capture Animal at Risk', color: 'pin-purple', top: '44%', left: '50%', anchorTop: '44%', anchorLeft: '50%' },
      { num: '5', label: '📍 Auto GPS: Forest / Creek Location', color: 'pin-amber', top: '58%', left: '50%', anchorTop: '58%', anchorLeft: '50%' },
      { num: '6', label: '🚨 Report Deforestation / Trap to Rangers', color: 'pin-green', top: '64%', left: '50%', anchorTop: '64%', anchorLeft: '50%' }
    ],
    contentHtml: `
      <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #7e22ce; letter-spacing: 0.8px; display: block; margin-bottom: 6px;">
          FOUR DAILY APP USE-CASES FOR SUNDARBAN VILLAGERS:
        </span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; color: #1e293b;">
          <div>
            <strong style="color: #7e22ce;">① Check Net Before Fishing:</strong>
            <p style="color: #475569; margin-top: 2px;">Fishermen point phone camera at their nets on the riverbank to verify mesh legality before casting, preventing fines and police seizure.</p>
          </div>
          <div>
            <strong style="color: #0284c7;">② Awareness of the Law:</strong>
            <p style="color: #475569; margin-top: 2px;">Bilingual Bengali statutory cards educate villagers on Fisheries Act 1950 & Wildlife Act 2012 penalties without legal jargon.</p>
          </div>
          <div>
            <strong style="color: #059669;">③ Don't Catch Illegal Species:</strong>
            <p style="color: #475569; margin-top: 2px;">Ensures fishermen do not endanger Irrawaddy dolphins, sea turtles, or protected hilsa breeding grounds.</p>
          </div>
          <div>
            <strong style="color: #dc2626;">④ Report Deforestation & Animal in Risk:</strong>
            <p style="color: #475569; margin-top: 2px;">Citizens log photos of illegal tree felling or an injured tiger/deer trapped in mud straight into the local emergency queue.</p>
          </div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.45;">
        🤝 <strong>COMMUNITY STEWARDSHIP:</strong> Turns coastal villagers from passive bystanders into active guardians of the mangrove shield.
      </div>
    `
  },

  // TOPIC 4: Ranger NASA Satellite Ops
  {
    topicNumber: 4,
    name: 'slide_topic_4_nasa_deforestation',
    topicTag: 'Ranger Satellite Ops',
    tagClass: 'tag-amber',
    tagLabel: 'Topic 4: For Forest Rangers — NASA Satellite Deforestation',
    title: 'NASA Satellite Remote Sensing:<br><span style="color:#b45309;">Tracking Mangrove Loss</span>',
    subtitle: 'Forest rangers ingest NASA MODIS 250m NDVI vegetation index anomalies to locate illegal tree-felling hotspots and mangrove clearings without active internet.',
    phone1Img: ssRiskArea,
    phone1Label: 'FIG 4.1: Satellite Risk Zone Radar',
    phone1Badge: 'NASA MODIS Ingest • High Risk Alert',
    phone1Pins: [
      { num: '1', label: 'ACTIVE_ANOMALY Alert Flag', color: 'pin-red', top: '45%', left: '50%', anchorTop: '47%', anchorLeft: '72%' },
      { num: '2', label: 'ΔNDVI -0.1550 Canopy Drop', color: 'pin-amber', top: '58%', left: '50%', anchorTop: '60%', anchorLeft: '70%' },
      { num: '3', label: 'Surface Temp 32.7°C Heat Sensor', color: 'pin-blue', top: '65%', left: '50%', anchorTop: '65%', anchorLeft: '32%' },
      { num: '4', label: 'One-Tap Patrol Rudder Compass', color: 'pin-green', top: '80%', left: '50%', anchorTop: '81%', anchorLeft: '50%' }
    ],
    phone2Img: ssDeforest,
    phone2Label: 'FIG 4.2: Deforestation Heatmap Overlay',
    phone2Badge: 'ΔNDVI -0.1550 • Tree Felling Hotspot',
    phone2Pins: [
      { num: '5', label: 'Tree Felling Hotspot (Δ -0.17)', color: 'pin-red', top: '48%', left: '50%', anchorTop: '49%', anchorLeft: '65%' },
      { num: '6', label: 'Mangrove Loss Sector (Δ -0.19)', color: 'pin-red', top: '55%', left: '50%', anchorTop: '54%', anchorLeft: '75%' },
      { num: '7', label: 'Offline Sector Grid Layer', color: 'pin-blue', top: '21%', left: '50%', anchorTop: '21%', anchorLeft: '80%' }
    ],
    contentHtml: `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #b45309; letter-spacing: 1px; display: block; margin-bottom: 6px;">
          MARKED SATELLITE ENGINE FUNCTIONS:
        </span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #1e293b;">
          <div><strong>① ACTIVE_ANOMALY Flag:</strong> Automatically triggered when 16-day cycle NDVI falls below -0.1550.</div>
          <div><strong>②-③ Spectral Telemetry:</strong> Surface temperature and cloud cover verification eliminate false positives.</div>
          <div><strong>④ Focus Monitoring Sector:</strong> Calculates compass bearing directly to the clearing coordinates.</div>
          <div><strong>⑤-⑥ Heatmap Overlay:</strong> High-risk polygons pinpoint timber syndicate activity deep inside the reserve.</div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #0f172a; letter-spacing: 0.8px; display: block; margin-bottom: 4px;">OPERATIONAL IMPACT FOR RANGERS:</span>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.45;">
          Patrol teams no longer waste fuel conducting random sweeps across 10,000 km² of water channels. The NASA satellite risk grid directs patrol speedboats straight to illegal tree felling camps within minutes.
        </p>
      </div>

      <div style="display: flex; gap: 10px;">
        <span style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ PRE-CACHED SATELLITE GRIDS</span>
        <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ COMPASS TARGETING</span>
        <span style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">✓ ZERO-INTERNET RADAR</span>
      </div>
    `
  },

  // TOPIC 5: Telecom Handshake & Auto-Sync
  {
    topicNumber: 5,
    name: 'slide_topic_5_cellular_sync',
    topicTag: 'Telecom Handshake',
    tagClass: 'tag-cyan',
    tagLabel: 'Topic 5: Cellular Network Handshake & Auto-Sync',
    title: 'Connecting to Coastal Cellular:<br><span style="color:#0284c7;">Instant HQ Sync & Satellite Update</span>',
    subtitle: 'When patrol boats or villagers reach coastal coverage, the terminal automatically handshakes with coastal 4G/5G towers and flushes citizen reports & incident dossiers to HQ.',
    phone1Img: ssHome2,
    phone1Label: 'FIG 5.1: Cellular Network Handshake',
    phone1Badge: 'Connected • Syncing Incident Store',
    phone1Pins: [
      { num: '1', label: 'Coastal 4G/5G Connected', color: 'pin-cyan', top: '15%', left: '50%', anchorTop: '18%', anchorLeft: '32%' },
      { num: '2', label: 'Live Sector Refresh Active', color: 'pin-blue', top: '22%', left: '50%', anchorTop: '21%', anchorLeft: '80%' },
      { num: '3', label: 'Updated Hotspot Polygons', color: 'pin-red', top: '56%', left: '50%', anchorTop: '58%', anchorLeft: '65%' }
    ],
    phone2Img: ssReport2,
    phone2Label: 'FIG 5.2: Automated Case Dispatch',
    phone2Badge: 'Uploaded to Forest Dept HQ Cloud',
    phone2Pins: [
      { num: '4', label: 'Auto-Sync Background Daemon', color: 'pin-green', top: '24%', left: '50%', anchorTop: '24%', anchorLeft: '35%' },
      { num: '5', label: 'SYNCED (0 Reports Pending)', color: 'pin-green', top: '30%', left: '50%', anchorTop: '30%', anchorLeft: '78%' },
      { num: '6', label: 'Cryptographic GPS Coordinate Lock', color: 'pin-amber', top: '38%', left: '50%', anchorTop: '33%', anchorLeft: '45%' }
    ],
    contentHtml: `
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${astroLogo}" style="height: 28px; border-radius: 4px;" alt="AstroForge">
            <span style="font-weight: 900; color: #0284c7; font-size: 13px; letter-spacing: 0.8px;">COASTAL TELECOM HANDSHAKE & INGESTION</span>
          </div>
          <span style="background: #0284c7; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px;">AUTO-TRIGGERED</span>
        </div>
        <p style="font-size: 12.5px; color: #1e293b; line-height: 1.45;">
          The moment a patrol boat or villager approaches coastal river mouths or reaches a rural tower footprint, the phone detects connectivity and automatically executes a bidirectional handshake.
        </p>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 800; color: #0f172a; letter-spacing: 0.8px; display: block; margin-bottom: 4px;">MARKED TELEMETRY ARCHITECTURE:</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #475569;">
          <div><strong>①-③ Handshake & Ingest:</strong> Automatically fetches newly computed NASA thermal hotspot coordinates.</div>
          <div><strong>④ Background Daemon:</strong> Zero user intervention needed—sync executes silently in the ranger's pocket.</div>
          <div><strong>⑤-⑥ HQ Cloud Dispatch:</strong> Confirms full upload of seized illegal current nets, citizen deforestation reports, and poacher evidence.</div>
        </div>
      </div>

      <div style="font-size: 12px; color: #475569; line-height: 1.45; border-left: 3px solid #0284c7; padding-left: 10px;">
        🏆 <strong>HACK FOR HUMANITY 2026:</strong> Empowering on-device edge AI with scalable telecom infrastructure to preserve the world's largest mangrove forest for future generations.
      </div>
    `
  }
];

// Step 1: Render All 5 Slides
console.log('Rendering 5 App Preview slides with AstroForge & Hack For Humanity branding...');

topics.forEach((topic, idx) => {
  const htmlContent = buildLightSlide(topic);
  const tempHtml = path.join(outDir, `temp_${topic.name}.html`);
  fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

  const pngPath = path.join(outDir, `${topic.name}.png`);
  console.log(`[${idx + 1}/5] Rendering ${topic.name}.png (1920x1080)...`);

  execSync(`"${chromePath}" --headless=new --screenshot="${pngPath}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(tempHtml).href}"`, { stdio: 'inherit' });

  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
});

// Step 2: Render Slide 2 (The Crisis: National News Investigation Showcase)
console.log('[Slide 2] Rendering slide_news_crisis_overview.png...');

const crisisHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px; height: 1080px; overflow: hidden;
      background: #f8fafc; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif;
      position: relative;
    }
    .bg-canvas {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #f8fafc;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(217, 119, 6, 0.04) 0%, transparent 40%),
        linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    }
    .top-header {
      position: absolute; top: 22px; left: 48px; right: 48px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 2px solid #0f172a; padding-bottom: 12px; z-index: 20;
    }
    .brand-section { display: flex; align-items: center; gap: 16px; }
    .astro-logo-img { height: 48px; width: 48px; border-radius: 10px; object-fit: cover; }
    .header-divider { width: 2px; height: 32px; background: #cbd5e1; }
    .brand-title { font-size: 14.5px; font-weight: 900; color: #dc2626; letter-spacing: 1.2px; text-transform: uppercase; }
    .brand-subtitle { font-size: 11.5px; font-weight: 600; color: #64748b; }
    .topic-number-pill { background: #dc2626; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 800; letter-spacing: 1px; }

    .main-grid {
      position: absolute; top: 106px; left: 48px; right: 48px; bottom: 68px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 32px; z-index: 20;
    }
    .news-card {
      background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;
      overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      display: flex; flex-direction: column;
    }
    .news-card img { width: 100%; height: 340px; object-fit: cover; }
    .news-card-body { padding: 20px 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 10.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-amber { background: #fef3c7; color: #b45309; }

    .bottom-bar {
      position: absolute; bottom: 14px; left: 48px; right: 48px; height: 44px;
      display: flex; align-items: center; justify-content: space-between;
      border-top: 1.5px solid #e2e8f0; padding-top: 8px; font-size: 12px; font-weight: 700; color: #64748b; z-index: 20;
    }
  </style>
</head>
<body>
  <div class="bg-canvas"></div>
  <div class="top-header">
    <div class="brand-section">
      <img src="${astroLogo}" class="astro-logo-img">
      <div class="header-divider"></div>
      <div>
        <div class="brand-title">THE ECOLOGICAL CRISIS • GROUND REALITY</div>
        <div class="brand-subtitle">Team AstroForge • Verified Investigative Journalism & Frontline Intelligence</div>
      </div>
    </div>
    <div class="topic-number-pill">PROBLEM STATEMENT</div>
  </div>

  <div class="main-grid">
    <!-- Card 1: Poison Fishing & Net Crisis -->
    <div class="news-card">
      <img src="${newsPoison}">
      <div class="news-card-body">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="badge badge-red">THE BUSINESS STANDARD SPECIAL INVESTIGATION</span>
            <span style="font-size:11.5px; color:#64748b; font-weight:600;">Verified Environmental Report</span>
          </div>
          <h2 style="font-size:20px; font-weight:800; color:#0f172a; line-height:1.3; margin-bottom:8px;">
            Poison Fishing & Monofilament Current Nets Devastating Mangrove Waterways
          </h2>
          <p style="font-size:13px; color:#475569; line-height:1.45;">
            Syndicates pour toxic agricultural chemicals into tidal canals to force instant fish harvests, destroying aquatic food chains and threatening endangered Ganges river dolphins. Tens of thousands of meters of nylon current nets trap wildlife indiscriminately.
          </p>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px; font-size:12px; color:#991b1b; font-weight:600; margin-top:12px;">
          ⚠️ IMPACT: Aquatic collapse across 400+ river channels & extinction risk for freshwater dolphins.
        </div>
      </div>
    </div>

    <!-- Card 2: Tiger Poaching & Canopy Loss -->
    <div class="news-card">
      <img src="${newsTiger}">
      <div class="news-card-body">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="badge badge-amber">DHAKA TRIBUNE FRONTLINE WATCH</span>
            <span style="font-size:11.5px; color:#64748b; font-weight:600;">Forest Department Sweeps</span>
          </div>
          <h2 style="font-size:20px; font-weight:800; color:#0f172a; line-height:1.3; margin-bottom:8px;">
            Tiger Poaching Snares & Silent Mangrove Canopy Deforestation
          </h2>
          <p style="font-size:13px; color:#475569; line-height:1.45;">
            Recovery of adult Royal Bengal Tiger carcasses in Sharankhola triggered nationwide alarms. Wire snares, deer venison syndicates (824kg seized in single raids), and unmonitored timber logging threaten the natural cyclone barrier protecting 30M+ people.
          </p>
        </div>
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 14px; font-size:12px; color:#92400e; font-weight:600; margin-top:12px;">
          ⚠️ ZERO CELLULAR COVERAGE: Forest rangers patrol blindly with 0 signal bars and no real-time telemetry.
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-bar">
    <span>Sundarban Sentinel • Hack For Humanity 2026</span>
    <span style="color:#dc2626; font-weight:800;">CRISIS EVIDENCE: NATIONAL INVESTIGATIVE JOURNALISM ARCHIVE</span>
    <span>Team AstroForge • Md Nushad Jaman Raj, Tanjid Hossen Rifat, Raf Rafin Mahmud</span>
  </div>
</body>
</html>`;

const tempCrisisHtml = path.join(outDir, 'temp_crisis.html');
const crisisPng = path.join(outDir, 'slide_news_crisis_overview.png');
fs.writeFileSync(tempCrisisHtml, crisisHtml, 'utf-8');

execSync(`"${chromePath}" --headless=new --screenshot="${crisisPng}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(tempCrisisHtml).href}"`, { stdio: 'inherit' });
if (fs.existsSync(tempCrisisHtml)) fs.unlinkSync(tempCrisisHtml);

console.log('🎉 ALL HACKATHON SLIDES SUCCESSFULLY GENERATED IN project_assets/hackathon_slides/!');
