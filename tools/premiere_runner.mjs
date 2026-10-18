import { WebSocketServer } from 'ws';

import fs from 'fs';

const port = 8097;
let scriptToRun = process.argv[2];

if (!scriptToRun) {
  console.error("No script provided");
  process.exit(1);
}

if (scriptToRun.startsWith('@') || scriptToRun.endsWith('.jsx')) {
  const filePath = scriptToRun.startsWith('@') ? scriptToRun.slice(1) : scriptToRun;
  scriptToRun = fs.readFileSync(filePath, 'utf-8');
}

const wss = new WebSocketServer({ port });

let resolved = false;

wss.on('listening', () => {
  console.log(`[Runner] Waiting for CEP connection on port ${port}...`);
});

wss.on('connection', (ws) => {
  console.log(`[Runner] CEP panel connected! Sending script...`);
  
  const msg = {
    id: "run-1",
    functionName: "executeScript",
    args: [scriptToRun]
  };
  
  ws.on('message', (data) => {
    try {
      const resp = JSON.parse(data.toString());
      if (resp.id === "run-1") {
        console.log("RESULT_START");
        console.log(JSON.stringify(resp.result || resp.error, null, 2));
        console.log("RESULT_END");
        resolved = true;
        setTimeout(() => {
          ws.close();
          wss.close();
          process.exit(0);
        }, 500);
      }
    } catch (e) {
      console.error("Parse error:", e);
    }
  });

  ws.send(JSON.stringify(msg));
});

setTimeout(() => {
  if (!resolved) {
    console.error("Timeout waiting for CEP execution");
    wss.close();
    process.exit(1);
  }
}, 20000);
