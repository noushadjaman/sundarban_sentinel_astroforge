import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ffmpegPath = ffmpegStatic;
const baseDir = path.resolve('tools/video_presentation');
const outDir = path.resolve('project_assets/video_slides_light');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function getBase64(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Loading assets for LIGHT THEME pitch video...');
const gpLogo = getBase64('project_assets/Grameenphone_logo_PNG1.png');
const scene1Ranger = getBase64('project_assets/video_scene1_ranger_patrol.jpg');
const scene2Community = getBase64('project_assets/video_scene2_ranger_community.jpg');
const scene3GpTower = getBase64('project_assets/video_scene3_grameenphone_network.jpg');
const appTiger = getBase64('screenshots/raretiger.png');
const appNet = getBase64('screenshots/riskynetdetectoffline.png');
const appDeer = getBase64('screenshots/deer.png');
const appNasa = getBase64('screenshots/riskarea1.png');
const appOffline = getBase64('screenshots/offlinemode.png');

console.log('Assets loaded. Generating LIGHT THEME 1080p slide templates...');

// Light Theme Slide Builder
function buildLightSlideHtml(contentHtml, bgImg = '') {
  const bgHtml = bgImg ? `
    <div class="slide-bg" style="background-image: url('${bgImg}');"></div>
    <div class="slide-overlay"></div>
  ` : `
    <div class="slide-clean-bg"></div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=JetBrains+Mono:wght@600;700;800&family=Hind+Siliguri:wght@600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #f8fafc;
      color: #0f172a;
      font-family: 'Inter', -apple-system, sans-serif;
      position: relative;
    }

    .slide-clean-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%);
    }

    .slide-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-size: cover;
      background-position: center;
      filter: saturate(1.1);
    }

    .slide-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.88) 55%, rgba(241,245,249,0.95) 100%);
    }

    .top-bar {
      position: absolute;
      top: 26px; left: 48px; right: 48px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      z-index: 10;
    }

    .gp-badge {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .gp-badge img {
      height: 44px;
      object-fit: contain;
    }

    .gp-sub {
      font-size: 12px;
      font-weight: 800;
      color: #0077b6;
      letter-spacing: 1.8px;
      text-transform: uppercase;
    }

    .slide-body-wrap {
      position: absolute;
      top: 115px; left: 48px; right: 48px; bottom: 85px;
      z-index: 10;
      display: flex;
    }

    .bottom-bar {
      position: absolute;
      bottom: 22px; left: 48px; right: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid #cbd5e1;
      padding-top: 10px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
      z-index: 10;
    }

    /* Light Theme Cards */
    .light-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px 36px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    /* Smartphone Frame - Titanium Silver */
    .phone-mockup {
      width: 375px;
      height: 720px;
      background: #ffffff;
      border-radius: 44px;
      border: 5px solid #0f172a;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0,0,0,0.05);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .phone-speaker {
      width: 70px;
      height: 5px;
      background: #cbd5e1;
      border-radius: 3px;
      margin: 4px auto 8px auto;
    }

    .phone-screen {
      flex: 1;
      border-radius: 32px;
      overflow: hidden;
      background: #000000;
    }

    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  ${bgHtml}
  ${contentHtml}
</body>
</html>`;
}

// 7 Light Theme Slides
const slides = [
  // SLIDE 1: Wilderness Isolation (Light)
  {
    name: 'slide_1_wilderness_isolation',
    duration: 6,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • IDEA COMPETITION PITCH</span>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #f87171; color: #dc2626; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          🔴 100% OFFLINE FIELD ENVIRONMENT
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #fee2e2; color: #b91c1c; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            THE DEEP SUNDARBANS PROBLEM
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            10,000 km² Mangrove Labyrinth.<br><span style="color:#0077b6;">Zero Cellular Coverage.</span>
          </h1>
          <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Deep inside the tidal creeks of the Sundarbans, Bangladeshi forest rangers face a total communication blackout. Traditional conservation apps fail because they depend on online cloud servers.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px;">
            <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px; text-align: center;">
              <span style="font-size: 28px; font-weight: 900; color: #dc2626; font-family: 'Playfair Display', serif; display: block;">0 BARS</span>
              <span style="font-size: 11.5px; color: #475569; font-weight: 700;">Zero Connectivity</span>
            </div>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; text-align: center;">
              <span style="font-size: 28px; font-weight: 900; color: #0284c7; font-family: 'Playfair Display', serif; display: block;">100%</span>
              <span style="font-size: 11.5px; color: #475569; font-weight: 700;">On-Device Edge</span>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; text-align: center;">
              <span style="font-size: 28px; font-weight: 900; color: #059669; font-family: 'Playfair Display', serif; display: block;">114 TIGERS</span>
              <span style="font-size: 11.5px; color: #475569; font-weight: 700;">Survival Mandate</span>
            </div>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #dc2626; border: 1px solid #e2e8f0; border-left-width: 4px; padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 14.5px; line-height: 1.5; color: #1e293b;">
            <strong>THE OPERATIONAL BOTTLENECK:</strong> When rangers intercept an illegal current jal net or injured tiger, they cannot access online databases. They need autonomous on-device edge intelligence.
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <div class="phone-mockup">
            <div class="phone-speaker"></div>
            <div class="phone-screen">
              <img src="${appOffline}">
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 1: The Wilderness Isolation Problem</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 00:00 - 00:25</span>
      </div>
    `, scene1Ranger)
  },

  // SLIDE 2: Hunter Deterrence & Community Education (Light)
  {
    name: 'slide_2_hunter_deterrence',
    duration: 6,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • COMMUNITY ENGAGEMENT</span>
        </div>
        <div style="background: #fffbeb; border: 1.5px solid #f59e0b; color: #b45309; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          🤝 PREVENTATIVE LEGAL DETERRENCE
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #fef3c7; color: #92400e; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            STOPPING POACHING AT THE SOURCE
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            Educating Fishermen & Hunters:<br><span style="color:#b45309;">On-Screen Law Enforcement</span>
          </h1>
          <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Many coastal villagers and honey collectors are recruited by commercial deer meat syndicates. Sundarban Sentinel acts as an interactive field deterrent by presenting explicit legal statutory penalties directly to them.
          </p>

          <div style="background: #fff8f8; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <span style="background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">জামিন-অযোগ্য (NON-BAILABLE)</span>
              <span style="background: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">তফসিল-১ (SCHEDULE-I)</span>
            </div>
            <h3 style="font-family: 'Hind Siliguri', sans-serif; font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">বন্যপ্রাণী (সংরক্ষণ ও নিরাপত্তা) আইন, ২০১২ (ধারা ৩৬)</h3>
            <p style="font-family: 'Hind Siliguri', sans-serif; font-size: 15px; color: #991b1b; line-height: 1.5; font-weight: 600;">
              দণ্ড ও সাজা: ২ থেকে ৭ বছর সশ্রম কারাদণ্ড এবং ১ লাখ থেকে ১০ লাখ টাকা জরিমানা। পুনরাবৃত্তিতে সর্বোচ্চ ১২ বছর কারাদণ্ড।
            </p>
          </div>

          <div style="font-style: italic; color: #475569; font-size: 14.5px; border-left: 3px solid #f59e0b; padding-left: 12px; line-height: 1.5;">
            "By showing the official law card and court penalties right at the riverbank, rangers turn suspected poachers into conservation partners."
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <div class="phone-mockup">
            <div class="phone-speaker"></div>
            <div class="phone-screen">
              <img src="${appDeer}">
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 2: Hunter Deterrence & Community Education</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 00:25 - 00:55</span>
      </div>
    `, scene2Community)
  },

  // SLIDE 3: Edge AI Detection & Voiceover Sync (00:55 - 01:45)
  {
    name: 'slide_3_edge_ai_detection',
    duration: 8,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • CORE TECHNOLOGY DEMO</span>
        </div>
        <div style="background: #ecfdf5; border: 1.5px solid #10b981; color: #047857; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          ⚡ VOICE SYNC LAYER [00:55 - 01:45]
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #d1fae5; color: #065f46; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            ON-DEVICE EDGE INFERENCE ENGINE
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            Quantized YOLOv8 Neural Engine &<br><span style="color:#059669;">Decoupled Statutory Decoder</span>
          </h1>

          <!-- User's Exact Voiceover Box -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #059669; border-radius: 8px; padding: 18px 22px; margin-bottom: 20px;">
            <span style="font-size: 11.5px; font-weight: 800; color: #047857; letter-spacing: 1.2px; display: block; margin-bottom: 6px;">PITCH VOICEOVER SCRIPT (00:55 - 01:45):</span>
            <p style="font-family: 'Playfair Display', serif; font-size: 17.5px; line-height: 1.55; color: #0f172a;">
              "Introducing <strong>Sundarban Sentinel</strong>: an offline edge-AI conservation terminal. Powered by a <strong>custom quantized YOLOv8 neural network</strong>, our mobile engine operates entirely on-device with zero cloud reliance. Rangers simply point their phone to detect protected wildlife and illegal nets in milliseconds. Instantly, our decoupled statutory engine maps the detection to the <strong>Bangladesh Wildlife Conservation Act 2012 and Fisheries Act 1950</strong> — generating court-admissible evidence cards with exact legal sections, non-bailable status, and GPS coordinates."
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 13px;">
              <span style="color:#64748b; display:block;">Model Architecture:</span>
              <strong style="color:#0f172a; font-family:'JetBrains Mono';">INT8 YOLOv8 Nano (5 Classes)</strong>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 13px;">
              <span style="color:#64748b; display:block;">On-Device Latency:</span>
              <strong style="color:#059669; font-family:'JetBrains Mono';">353ms - 509ms CPU/NPU</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <div class="phone-mockup" style="border-color: #059669; box-shadow: 0 25px 60px rgba(5,150,105,0.18);">
            <div class="phone-speaker"></div>
            <div class="phone-screen">
              <img src="${appTiger}">
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 3: Offline Edge AI & Legal Statutory Engine</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 00:55 - 01:45</span>
      </div>
    `)
  },

  // SLIDE 4: Illegal Net Interception (Light)
  {
    name: 'slide_4_illegal_nets',
    duration: 6,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • ENVIRONMENTAL LAW ENFORCEMENT</span>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #dc2626; color: #dc2626; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          🚨 ILLEGAL GEAR INTERCEPTION
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #fee2e2; color: #b91c1c; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            CRITICAL FISHERIES PROTECTION
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            Detecting Forbidden Current Jal:<br><span style="color:#dc2626;">Protection of Marine Dolphins</span>
          </h1>
          <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Abandoned monofilament current nets kill over <strong>65% of dolphins and whales</strong> in Bangladeshi coastal waters. Sundarban Sentinel detects tangled nets underwater or laid across tidal channels in <strong>353 milliseconds</strong>.
          </p>

          <div style="background: #fff8f8; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
              <span style="background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">CRITICAL LEGAL VIOLATION 95.0%</span>
            </div>
            <h3 style="font-family: 'Hind Siliguri', sans-serif; font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">মৎস্য সুরক্ষা ও সংরক্ষণ আইন, ১৯৫০ (ধারা ৪খ ও ৫)</h3>
            <p style="font-family: 'Hind Siliguri', sans-serif; font-size: 15px; color: #334155; line-height: 1.5;">
              নিষিদ্ধ কারেন্ট জাল প্রস্তুত, পরিবহন, আমদানি বা ব্যবহার শাস্তিযোগ্য অপরাধ। ১ থেকে ২ বছরের সশ্রম কারাদণ্ড ও অর্থদণ্ড।
            </p>
          </div>

          <div style="font-size: 14.5px; color: #475569; line-height: 1.5;">
            🔒 <strong>COURT-READY CHAIN OF CUSTODY:</strong> The incident buffer locks the GPS timestamp, net mesh size, and officer badge ID into an immutable local SQLite vault.
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <div class="phone-mockup" style="border-color: #dc2626; box-shadow: 0 25px 60px rgba(220,38,38,0.18);">
            <div class="phone-speaker"></div>
            <div class="phone-screen">
              <img src="${appNet}">
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 3B: Illegal Net Detection & Fisheries Act 1950</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 01:15 - 01:45</span>
      </div>
    `)
  },

  // SLIDE 5: NASA Satellite Deforestation (Light)
  {
    name: 'slide_5_nasa_deforestation',
    duration: 6,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • SPACEBORNE REMOTE SENSING</span>
        </div>
        <div style="background: #f0f9ff; border: 1.5px solid #0284c7; color: #0284c7; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          🛰️ NASA EARTHDATA LIVE FEEDS
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #e0f2fe; color: #0369a1; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            MULTI-SPECTRAL CANOPY SURVEILLANCE
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            NASA Satellite NDVI Updates:<br><span style="color:#0284c7;">Realtime Deforestation Alerts</span>
          </h1>
          <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Beyond water patrols, Sundarban Sentinel ingests <strong>NASA MODIS 16-day cycle 250m vegetation granules</strong>. When illegal logging or top-dying occurs, NDVI delta drops negatively, projecting active risk polygons on the ranger's offline map.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 22px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
              <span style="font-size: 24px; font-weight: 900; color: #0f172a; font-family:'JetBrains Mono'; display:block;">0.6200</span>
              <span style="font-size: 11px; color: #64748b;">Baseline NDVI</span>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; text-align: center;">
              <span style="font-size: 24px; font-weight: 900; color: #b45309; font-family:'JetBrains Mono'; display:block;">0.4650</span>
              <span style="font-size: 11px; color: #92400e;">Current NDVI</span>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; text-align: center;">
              <span style="font-size: 24px; font-weight: 900; color: #dc2626; font-family:'JetBrains Mono'; display:block;">-0.1550</span>
              <span style="font-size: 11px; color: #b91c1c;">NDVI Delta</span>
            </div>
          </div>

          <div style="background: #f0f9ff; border-left: 4px solid #0284c7; border: 1px solid #bae6fd; border-left-width: 4px; padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 14.5px; line-height: 1.5; color: #0c4a6e;">
            🛰️ <strong>TARGETED RANGER DEPLOYMENT:</strong> Instead of blindly searching 10,000 square kilometers, patrol teams are guided directly to precise GPS coordinates where canopy loss is actively taking place.
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <div class="phone-mockup" style="border-color: #0284c7; box-shadow: 0 25px 60px rgba(2,132,199,0.18);">
            <div class="phone-speaker"></div>
            <div class="phone-screen">
              <img src="${appNasa}">
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 4: NASA Satellite NDVI Deforestation Monitoring</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 01:45 - 02:15</span>
      </div>
    `)
  },

  // SLIDE 6: Grameenphone Network Handshake (Light)
  {
    name: 'slide_6_grameenphone_handshake',
    duration: 7,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • NETWORK ECOSYSTEM</span>
        </div>
        <div style="background: #f0f9ff; border: 1.5px solid #00a9e0; color: #0077b6; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          📶 GRAMEENPHONE 5G HANDSHAKE ACTIVE
        </div>
      </div>

      <div class="slide-body-wrap" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 40px; align-items: center;">
        <div class="light-card">
          <div style="background: #e0f2fe; color: #0369a1; display: inline-block; padding: 5px 14px; border-radius: 4px; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
            THE POWER OF GRAMEENPHONE NETWORK
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; line-height: 1.15; color: #0f172a; margin-bottom: 16px;">
            Sudden Grameenphone Reconnection:<br><span style="color:#0077b6;">Zero-Data-Loss Buffer Flush</span>
          </h1>
          <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            As the ranger boat emerges from the deep forest creeks towards coastal waters, the phone <strong>suddenly acquires Grameenphone 4G/5G signals</strong>.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background:#00a9e0; color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; font-size:13px;">1</span>
              <span style="font-size: 15px; color:#1e293b;"><strong>Instant Cloud Sync:</strong> All buffered tiger sightings, nets, and evidence photos upload automatically.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background:#00a9e0; color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; font-size:13px;">2</span>
              <span style="font-size: 15px; color:#1e293b;"><strong>Realtime NASA Ingest:</strong> The latest satellite vegetation tiles download instantly to the terminal.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background:#00a9e0; color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; font-size:13px;">3</span>
              <span style="font-size: 15px; color:#1e293b;"><strong>Headquarters Dashboard:</strong> Command center receives court-admissible telemetry with zero data loss.</span>
            </div>
          </div>
        </div>

        <div class="light-card" style="text-align: center; border-color: #bae6fd; box-shadow: 0 16px 40px rgba(0,169,224,0.12);">
          <img src="${gpLogo}" style="height: 64px; margin-bottom: 18px;">
          <div style="font-family:'JetBrains Mono'; font-size: 16px; font-weight: 800; color: #0077b6; margin-bottom: 14px;">
            [GP-5G] COASTAL TOWER CONNECTED
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-family:'JetBrains Mono'; font-size: 13px; line-height: 1.6; color: #0369a1; text-align: left; margin-bottom: 18px;">
            &gt; Syncing 3 offline incident vaults...<br>
            &gt; Transmitting GPS: 21.8462° N, 89.4791° E...<br>
            &gt; Uploading court-ready evidence cards...<br>
            &gt; Pulling NASA MOD13Q1 NDVI granules...<br>
            <strong style="color:#059669;">&gt; [SUCCESS] Zero-Data-Loss sync completed!</strong>
          </div>
          <div style="color: #475569; font-size: 14px; font-weight: 500;">
            Grameenphone’s nationwide connectivity bridges the final mile for nature conservation.
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 5: Grameenphone Network Handshake & Auto-Sync</span>
        <span>Sundarban Sentinel • Grameenphone Futuremakers 2026</span>
        <span>Timeline: 02:15 - 02:50</span>
      </div>
    `, scene3GpTower)
  },

  // SLIDE 7: Futuremakers Conclusion (Light)
  {
    name: 'slide_7_futuremakers_conclusion',
    duration: 6,
    html: buildLightSlideHtml(`
      <div class="top-bar">
        <div class="gp-badge">
          <img src="${gpLogo}" alt="Grameenphone">
          <div style="border-left: 2px solid #cbd5e1; height: 30px; margin: 0 10px;"></div>
          <span class="gp-sub">FUTUREMAKERS 2026 • WINNING PITCH SUMMARY</span>
        </div>
        <div style="background: #f0f9ff; border: 1.5px solid #00a9e0; color: #0077b6; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
          🏆 AI FOR NATURE & PLANET
        </div>
      </div>

      <div class="slide-body-wrap" style="flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div class="light-card" style="max-width: 1250px; width: 100%;">
          <div style="background: #e0f2fe; color: #0284c7; display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 13px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">
            GRAMEENPHONE FUTUREMAKERS IDEA COMPETITION 2026
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 900; margin-bottom: 12px; color: #0f172a;">
            AI for Nature: Protecting the Sundarbans with Grameenphone
          </h1>
          <p style="font-size: 20px; color: #475569; max-width: 950px; margin: 0 auto 32px auto; line-height: 1.5;">
            An edge-to-cloud conservation infrastructure uniting on-device artificial intelligence with Bangladesh’s leading digital telecommunications backbone.
          </p>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; text-align: left;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px;">
              <span style="font-size: 26px; display:block; margin-bottom: 6px;">🧠</span>
              <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">100% Offline Edge AI</h3>
              <p style="font-size: 13px; color: #64748b; line-height: 1.45;">Zero cloud latency. Custom quantized YOLOv8 running on local mobile hardware.</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px;">
              <span style="font-size: 26px; display:block; margin-bottom: 6px;">⚖️</span>
              <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Court-Ready Law</h3>
              <p style="font-size: 13px; color: #64748b; line-height: 1.45;">Decoupled statutory engine mapping Wildlife Act 2012 and Fisheries Act 1950.</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px;">
              <span style="font-size: 26px; display:block; margin-bottom: 6px;">🛰️</span>
              <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">NASA Satellite</h3>
              <p style="font-size: 13px; color: #64748b; line-height: 1.45;">Realtime MODIS NDVI vegetation delta tracking to intercept illegal deforestation.</p>
            </div>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 18px; border-radius: 8px;">
              <span style="font-size: 26px; display:block; margin-bottom: 6px;">📶</span>
              <h3 style="font-size: 15px; font-weight: 800; color: #0077b6; margin-bottom: 6px;">Grameenphone 5G</h3>
              <p style="font-size: 13px; color: #64748b; line-height: 1.45;">Zero-data-loss coastal handshake delivering real-time telemetry to national HQ.</p>
            </div>
          </div>

          <div style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 19px; color: #0077b6; line-height: 1.5; border-top: 1.5px solid #e2e8f0; padding-top: 18px;">
            "Together with Grameenphone Futuremakers, we can protect the Royal Bengal Tiger, eradicate illegal current nets, and preserve the Sundarbans as Bangladesh's living shield."
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <span>Part 6: Grameenphone Futuremakers 2026 Vision</span>
        <span>Sundarban Sentinel • Edge AI Offline Conservation Terminal</span>
        <span>Timeline: 02:50 - 03:10</span>
      </div>
    `)
  }
];

// Step 1: Render All Slides to 1920x1080 PNG using Chrome Headless
console.log('Rendering all 7 LIGHT THEME HD slides using Google Chrome headless...');

const renderedPngPaths = [];

slides.forEach((slide, idx) => {
  const tempHtml = path.join(outDir, `temp_${slide.name}.html`);
  fs.writeFileSync(tempHtml, slide.html, 'utf-8');

  const pngPath = path.join(outDir, `${slide.name}.png`);
  console.log(`[${idx + 1}/7] Rendering ${slide.name}.png...`);
  
  execSync(`"${chromePath}" --headless=new --screenshot="${pngPath}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(tempHtml).href}"`, { stdio: 'inherit' });
  
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  renderedPngPaths.push({ path: pngPath, duration: slide.duration });
});

console.log('All light-theme slides rendered to PNG successfully!');

// Step 2: Assemble Video with FFmpeg
console.log('Compiling light-theme video presentation using FFmpeg...');

const concatListFile = path.join(outDir, 'concat_list.txt');
let concatContent = '';

renderedPngPaths.forEach(item => {
  const formattedPath = item.path.replace(/\\/g, '/');
  concatContent += `file '${formattedPath}'\n`;
  concatContent += `duration ${item.duration}\n`;
});
const lastFormatted = renderedPngPaths[renderedPngPaths.length - 1].path.replace(/\\/g, '/');
concatContent += `file '${lastFormatted}'\n`;

fs.writeFileSync(concatListFile, concatContent, 'utf-8');

const finalMp4Path = path.resolve('project_assets/sundarban_sentinel_pitch_presentation_light_1080p.mp4');

// Run FFmpeg to encode 1080p MP4
const ffmpegCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListFile.replace(/\\/g, '/')}" -c:v libx264 -r 30 -pix_fmt yuv420p -preset medium -crf 20 "${finalMp4Path.replace(/\\/g, '/')}"`;

console.log('Running FFmpeg encoding command for LIGHT THEME video...');
execSync(ffmpegCmd, { stdio: 'inherit' });

console.log(`LIGHT THEME video generated successfully at: ${finalMp4Path}`);
console.log('File size:', fs.statSync(finalMp4Path).size, 'bytes');
