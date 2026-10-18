import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" width="800" height="240">
  <defs>
    <linearGradient id="gp_blue1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00b4d8"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </linearGradient>
    <linearGradient id="gp_blue2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#48cae4"/>
      <stop offset="100%" stop-color="#0096c7"/>
    </linearGradient>
    <linearGradient id="gp_blue3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0077b6"/>
      <stop offset="100%" stop-color="#023e8a"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>

  <g transform="translate(40, 20)">
    <!-- Iconic 3-Petal Aerodynamic Emblem -->
    <g transform="translate(90, 100) scale(0.9)" filter="url(#shadow)">
      <!-- Top Petal -->
      <path d="M 0,0 C -30,-45 -40,-85 0,-115 C 35,-85 30,-45 0,0 Z" fill="url(#gp_blue1)"/>
      <!-- Bottom Right Petal -->
      <path d="M 0,0 C 45, -5 85,20 100,60 C 65,75 30,50 0,0 Z" fill="url(#gp_blue2)"/>
      <!-- Bottom Left Petal -->
      <path d="M 0,0 C -25,40 -60,65 -100,55 C -95,20 -60,-10 0,0 Z" fill="url(#gp_blue3)"/>
      <!-- Center Core -->
      <circle cx="0" cy="0" r="12" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Wordmark -->
    <text x="210" y="118" font-family="'Inter', 'Segoe UI', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0077b6" letter-spacing="-1.5">
      grameenphone
    </text>
    <text x="212" y="152" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#0096c7" letter-spacing="4.5">
      FUTUREMAKERS 2026
    </text>
  </g>
</svg>`;

const svgPath = path.resolve('project_assets/grameenphone_logo.svg');
fs.writeFileSync(svgPath, svgContent, 'utf-8');

// Render to high-resolution PNG
const htmlPath = path.resolve('project_assets/temp_gp_logo.html');
const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; width: 800px; height: 240px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
fs.writeFileSync(htmlPath, html, 'utf-8');

const pngDest = path.resolve('project_assets/grameenphone_logo.png');
execSync(`"${chromePath}" --headless=new --screenshot="${pngDest}" --window-size=800,240 --default-background-color=00000000 "${pathToFileURL(htmlPath).href}"`, { stdio: 'inherit' });

if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);

console.log('Generated Grameenphone logo vector & PNG:', fs.statSync(pngDest).size, 'bytes');
