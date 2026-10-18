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
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

console.log('Testing AstroForge logo and screenshot load...');
const astroLogo = getBase64('project_assets/astroforge_badge_sq.png');
const ssHome1 = getBase64('screenshots/home1.png');
const ssOffline = getBase64('screenshots/offlinemode.png');

console.log('Rendering test hackathon slide...');
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px; height: 1080px; overflow: hidden;
      background: #f8fafc; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; flex-direction: column; justify-content: space-between; padding: 32px 48px;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 2px solid #0f172a; padding-bottom: 16px;
    }
    .brand { display: flex; align-items: center; gap: 16px; }
    .brand img { height: 50px; border-radius: 8px; }
    .title { font-size: 16px; font-weight: 800; color: #0284c7; letter-spacing: 1px; }
    .sub { font-size: 13px; color: #64748b; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${astroLogo}">
      <div>
        <div class="title">SUNDARBAN SENTINEL • HACK FOR HUMANITY</div>
        <div class="sub">Team AstroForge • Md Nushad Jaman Raj, Tanjid Hossen Rifat, Raf Rafin Mahmud</div>
      </div>
    </div>
    <div><strong>TOPIC 01 / 05</strong></div>
  </div>
  <div style="font-size: 28px; font-weight: bold; margin: 40px 0;">Test Slide Rendered Successfully</div>
  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 13px; color: #64748b;">
    Hack For Humanity 2026 • Team AstroForge
  </div>
</body>
</html>`;

const tempHtml = path.join(outDir, 'temp_test.html');
const testPng = path.join(outDir, 'test_rendered.png');
fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

execSync(`"${chromePath}" --headless=new --screenshot="${testPng}" --window-size=1920,1080 --hide-scrollbars "${pathToFileURL(tempHtml).href}"`, { stdio: 'inherit' });
if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);

if (fs.existsSync(testPng)) {
  const stat = fs.statSync(testPng);
  console.log(`Test slide successfully rendered: ${testPng} (${stat.size} bytes)`);
} else {
  console.log('Failed to render test slide.');
}
