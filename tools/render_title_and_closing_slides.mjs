import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('project_assets/hackathon_slides');

function getBase64(filePath) {
  const abs = path.resolve(filePath);
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(abs).toString('base64');
  return `data:${mime};base64,${data}`;
}

const astroLogo = getBase64('project_assets/astroforge_badge_sq.png');

// Render Slide 1: Title Slide (1920x1080)
const slide1Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px; height: 1080px; overflow: hidden;
      background: #f8fafc; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif;
      position: relative; padding: 60px 80px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .bg-canvas {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #f8fafc;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.05) 0%, transparent 40%),
        linear-gradient(to right, rgba(226, 232, 240, 0.45) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.45) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    }
    .content-wrap { position: relative; z-index: 20; display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
    .hero-grid { display: grid; grid-template-columns: 1100px 600px; gap: 60px; align-items: center; margin-top: 20px; }
    .pill { display: inline-flex; align-items: center; gap: 8px; background: #e0f2fe; border: 1.5px solid #0284c7; color: #0284c7; padding: 6px 18px; border-radius: 30px; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
    .main-title { font-size: 64px; font-weight: 900; line-height: 1.1; color: #0f172a; letter-spacing: -1.5px; margin-bottom: 16px; }
    .main-subtitle { font-size: 26px; font-weight: 800; color: #0284c7; line-height: 1.3; margin-bottom: 20px; }
    .main-desc { font-size: 18px; color: #475569; line-height: 1.55; max-width: 980px; }
    .team-card {
      background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 24px; padding: 36px 32px;
      box-shadow: 0 20px 45px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .team-card img { height: 130px; width: 130px; border-radius: 20px; object-fit: cover; margin-bottom: 18px; box-shadow: 0 8px 25px rgba(15,23,42,0.18); }
    .team-name { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; }
    .hackathon-badge { font-size: 13.5px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 4px 14px; border-radius: 20px; margin: 8px 0 20px 0; }
    .member-list { font-size: 16px; color: #1e293b; font-weight: 700; line-height: 1.7; }
    .bottom-pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .pillar-box {
      background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 22px 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.04);
    }
    .pillar-title { font-size: 16px; font-weight: 800; color: #0284c7; margin-bottom: 6px; }
    .pillar-desc { font-size: 13.5px; color: #64748b; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="bg-canvas"></div>
  <div class="content-wrap">
    <div class="hero-grid">
      <div>
        <div class="pill">★ HACK FOR HUMANITY 2026 • SUSTAINABLE PLANET & CONSERVATION</div>
        <h1 class="main-title">SUNDARBAN SENTINEL</h1>
        <div class="main-subtitle">Offline Edge-AI Conservation Terminal & NASA Satellite Anomaly Radar</div>
        <p class="main-desc">
          An end-to-end, zero-mock production distributed system integrating live NASA Earthdata satellite telemetry, on-device quantized INT8 computer vision, and offline-first edge persistence for mangrove conservation and anti-poaching operations.
        </p>
      </div>
      <div class="team-card">
        <img src="${astroLogo}">
        <div class="team-name">TEAM ASTROFORGE</div>
        <div class="hackathon-badge">HACK FOR HUMANITY 2026</div>
        <div class="member-list">
          <div>Md Nushad Jaman Raj</div>
          <div>Tanjid Hossen Rifat</div>
          <div>Raf Rafin Mahmud</div>
        </div>
      </div>
    </div>

    <div class="bottom-pillars">
      <div class="pillar-box">
        <div class="pillar-title" style="color:#0284c7;">⚡ 100% Offline Edge AI</div>
        <div class="pillar-desc">On-device INT8 YOLOv8 model running at 353ms latency with zero cloud dependency.</div>
      </div>
      <div class="pillar-box">
        <div class="pillar-title" style="color:#059669;">🛰️ NASA Earthdata Live</div>
        <div class="pillar-desc">CMR MODIS 250m NDVI canopy loss deltas mapped directly to offline ranger maps.</div>
      </div>
      <div class="pillar-box">
        <div class="pillar-title" style="color:#d97706;">⚖️ Statutory Legal Engine</div>
        <div class="pillar-desc">Decoupled bilingual statutory deterrence under Bangladesh Wildlife & Fisheries Acts.</div>
      </div>
      <div class="pillar-box">
        <div class="pillar-title" style="color:#7c3aed;">🛡️ Resilient Cloud Handshake</div>
        <div class="pillar-desc">Encrypted SQLite queue auto-syncing to Cloudflare Workers gateway & Firestore.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

// Render Slide 8: Production Architecture & Team AstroForge (1920x1080)
const slide8Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px; height: 1080px; overflow: hidden;
      background: #f8fafc; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif;
      position: relative; padding: 36px 48px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .bg-canvas {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #f8fafc;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.04) 0%, transparent 40%),
        linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    }
    .top-header {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 2px solid #0f172a; padding-bottom: 14px; position: relative; z-index: 20;
    }
    .brand-section { display: flex; align-items: center; gap: 16px; }
    .astro-logo-img { height: 48px; width: 48px; border-radius: 10px; object-fit: cover; }
    .header-divider { width: 2px; height: 32px; background: #cbd5e1; }
    .brand-title { font-size: 15px; font-weight: 900; color: #0284c7; letter-spacing: 1.2px; text-transform: uppercase; }
    .brand-subtitle { font-size: 11.5px; font-weight: 600; color: #64748b; }
    .topic-pill { background: #0f172a; color: #ffffff; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 800; letter-spacing: 1px; }

    .main-grid {
      display: grid; grid-template-columns: 1000px 780px; gap: 40px; margin: 24px 0;
      position: relative; z-index: 20; flex: 1; align-items: stretch;
    }
    .card {
      background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 32px 36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;
    }
    .card-title { font-size: 18px; font-weight: 900; color: #0284c7; letter-spacing: 0.8px; margin-bottom: 18px; text-transform: uppercase; }
    .arch-step {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 18px; margin-bottom: 12px;
    }
    .arch-step-head { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .arch-step-body { font-size: 12px; color: #475569; line-height: 1.45; }

    .roster-item {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #f1f5f9; padding: 12px 0;
    }
    .roster-name { font-size: 15px; font-weight: 800; color: #0f172a; }
    .roster-role { font-size: 12px; font-weight: 600; color: #0284c7; background: #e0f2fe; padding: 3px 10px; border-radius: 12px; }

    .bottom-bar {
      border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between;
      font-size: 12px; font-weight: 700; color: #64748b; position: relative; z-index: 20;
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
        <div class="brand-title">PRODUCTION ARCHITECTURE & SCALABLE IMPACT</div>
        <div class="brand-subtitle">Team AstroForge • Final Synthesis & Global Conservation Blueprint</div>
      </div>
    </div>
    <div class="topic-pill">HACK FOR HUMANITY 2026</div>
  </div>

  <div class="main-grid">
    <!-- Left: Architecture Stack -->
    <div class="card">
      <div>
        <div class="card-title">100% PRODUCTION ARCHITECTURE • ZERO MOCK DATA</div>
        
        <div class="arch-step">
          <div class="arch-step-head">
            <span>🛰️ NASA Earthdata Ingestion Pipeline</span>
            <span style="color:#0284c7; font-size:11px;">PYTHON / CMR API</span>
          </div>
          <div class="arch-step-body">
            Directly queries CMR search endpoints for MOD13Q1 (250m NDVI) and MOD11A2 (surface temp) over Sundarbans coordinates (89.00°E-89.95°E, 21.50°N-22.50°N).
          </div>
        </div>

        <div class="arch-step">
          <div class="arch-step-head">
            <span>🌐 Cloudflare Workers Edge Gateway</span>
            <span style="color:#059669; font-size:11px;">TYPESCRIPT / REST</span>
          </div>
          <div class="arch-step-body">
            Low-latency proxy (<code>sundarban-sentinel-gateway.workers.dev</code>) handling structured Firestore queries, strict CORS, and edge report ingestion.
          </div>
        </div>

        <div class="arch-step">
          <div class="arch-step-head">
            <span>☁️ Media CDN Pipeline (Cloudinary)</span>
            <span style="color:#d97706; font-size:11px;">DIRECT UPLOAD PRESET</span>
          </div>
          <div class="arch-step-body">
            Direct binary capture upload to unsigned preset (<code>sundarban_santinel</code>) eliminating backend server load.
          </div>
        </div>

        <div class="arch-step">
          <div class="arch-step-head">
            <span>📱 Flutter Mobile Client & TFLite NMS</span>
            <span style="color:#7c3aed; font-size:11px;">ON-DEVICE INT8 INFERENCE</span>
          </div>
          <div class="arch-step-body">
            Quantized 640x640 YOLOv8 model running at 353ms latency, local Hive box persistence, offline GPS tracking, and automatic background sync.
          </div>
        </div>
      </div>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 18px; font-size:12px; color:#166534; font-weight:600;">
        ✓ ZERO MOCK DATA: 100% live code, verified API keys, and production-tested on-device inference.
      </div>
    </div>

    <!-- Right: Team Roster & Impact -->
    <div class="card">
      <div>
        <div class="card-title" style="color:#059669;">TEAM ASTROFORGE ROSTER</div>
        
        <div class="roster-item">
          <div>
            <div class="roster-name">Md Nushad Jaman Raj</div>
            <div style="font-size:11.5px; color:#64748b;">Mobile Edge AI & Flutter Architecture</div>
          </div>
          <span class="roster-role">Team Lead</span>
        </div>

        <div class="roster-item">
          <div>
            <div class="roster-name">Tanjid Hossen Rifat</div>
            <div style="font-size:11.5px; color:#64748b;">Cloudflare Workers Gateway & Cloud Architecture</div>
          </div>
          <span class="roster-role">Cloud Architect</span>
        </div>

        <div class="roster-item">
          <div>
            <div class="roster-name">Raf Rafin Mahmud</div>
            <div style="font-size:11.5px; color:#64748b;">NASA Earthdata Pipeline & Anomaly Engine</div>
          </div>
          <span class="roster-role">GIS Engineer</span>
        </div>
      </div>

      <div>
        <div class="card-title" style="color:#d97706; margin-top:16px; margin-bottom:12px;">HUMANITARIAN IMPACT & VISION</div>
        <div style="font-size:12.5px; color:#334155; line-height:1.5;">
          • <strong>Shielding 30M+ Citizens:</strong> Defending the mangrove barrier protects coastal Bangladesh from cyclone surges.<br>
          • <strong>Peaceful Co-Existence:</strong> Protects honey gatherers and fishermen from accidental court penalties.<br>
          • <strong>Replicable Global Blueprint:</strong> Ready for deployment across the Amazon, Congo Basin, and Southeast Asian reserves.
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-bar">
    <span>Sundarban Sentinel • Team AstroForge</span>
    <span style="color:#0284c7; font-weight:800;">THANK YOU • OPEN FOR Q&A</span>
    <span>Hack For Humanity 2026</span>
  </div>
</body>
</html>`;

const temp1 = path.join(outDir, 'temp_slide1.html');
const temp8 = path.join(outDir, 'temp_slide8.html');
const png1 = path.join(outDir, 'slide_1_title_astroforge.png');
const png8 = path.join(outDir, 'slide_8_architecture_team.png');

fs.writeFileSync(temp1, slide1Html, 'utf-8');
fs.writeFileSync(temp8, slide8Html, 'utf-8');

console.log('Rendering Slide 1 (Title)...');
execSync(`"${chromePath}" --headless=new --screenshot="${png1}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(temp1).href}"`, { stdio: 'inherit' });

console.log('Rendering Slide 8 (Architecture & Team)...');
execSync(`"${chromePath}" --headless=new --screenshot="${png8}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(temp8).href}"`, { stdio: 'inherit' });

if (fs.existsSync(temp1)) fs.unlinkSync(temp1);
if (fs.existsSync(temp8)) fs.unlinkSync(temp8);

console.log('Slide 1 and Slide 8 successfully rendered!');
