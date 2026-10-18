import http from 'http';
import fs from 'fs';

let script = process.argv[2];
if (script.startsWith('@') || script.endsWith('.jsx')) {
  script = fs.readFileSync(script.startsWith('@') ? script.slice(1) : script, 'utf-8');
}

const req = http.request({
  hostname: '127.0.0.1',
  port: 8098,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (err) => {
  console.error("HTTP error:", err.message);
});

req.write(JSON.stringify({ script }));
req.end();
