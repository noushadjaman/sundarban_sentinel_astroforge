const fs = require('fs');
const path = require('path');

const dir = 'F:/sundarbansanetile/videoedit/Adobe Premiere Pro Captured and Generated/video';
const clips = [
  'Audio 1_6.wav', 'Audio 1_10.wav', 'Audio 1_12.wav',
  'Audio 1_14.wav', 'Audio 1_15.wav', 'Audio 1_16.wav', 'Audio 1_19.wav'
];

for (const name of clips) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) continue;
  const buf = fs.readFileSync(p);
  
  let pos = 12;
  let dataOffset = 0;
  let dataLength = 0;
  while (pos < buf.length - 8) {
    const chunkId = buf.toString('ascii', pos, pos + 4);
    const chunkSize = buf.readUInt32LE(pos + 4);
    if (chunkId === 'data') {
      dataOffset = pos + 8;
      dataLength = chunkSize;
      break;
    }
    pos += 8 + chunkSize;
  }
  
  let maxPeak = 0;
  let sumSq = 0;
  let count = 0;
  for (let i = dataOffset; i < dataOffset + dataLength; i += 4) {
    const val = Math.abs(buf.readFloatLE(i));
    if (val > maxPeak) maxPeak = val;
    sumSq += val * val;
    count++;
  }
  const peakDb = 20 * Math.log10(maxPeak);
  const rmsDb = 20 * Math.log10(Math.sqrt(sumSq / count));
  console.log(`${name}: peak=${peakDb.toFixed(2)} dB, rms=${rmsDb.toFixed(2)} dB, maxPeak=${maxPeak.toFixed(4)}`);
}
