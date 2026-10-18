const fs = require('fs');
const path = require('path');

const dir = 'F:/sundarbansanetile/videoedit/Adobe Premiere Pro Captured and Generated/video';
const clips = [
  'Audio 1_6.wav', 'Audio 1_10.wav', 'Audio 1_12.wav',
  'Audio 1_14.wav', 'Audio 1_15.wav', 'Audio 1_16.wav', 'Audio 1_19.wav'
];

const TARGET_PEAK = 0.8414; // -1.5 dB peak

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
  
  // 1. Find max peak
  let maxPeak = 0;
  for (let i = dataOffset; i < dataOffset + dataLength; i += 4) {
    const val = Math.abs(buf.readFloatLE(i));
    if (val > maxPeak) maxPeak = val;
  }
  
  if (maxPeak <= 0.0001) {
    console.log(`${name}: empty or silent, skipping`);
    continue;
  }

  // 2. Calculate multiplier
  const multiplier = TARGET_PEAK / maxPeak;
  const oldPeakDb = (20 * Math.log10(maxPeak)).toFixed(2);
  const boostDb = (20 * Math.log10(multiplier)).toFixed(2);

  // 3. Apply multiplier to each sample
  for (let i = dataOffset; i < dataOffset + dataLength; i += 4) {
    const orig = buf.readFloatLE(i);
    let amplified = orig * multiplier;
    // Safety clamp to [-1.0, 1.0] just in case
    if (amplified > 1.0) amplified = 1.0;
    if (amplified < -1.0) amplified = -1.0;
    buf.writeFloatLE(amplified, i);
  }

  // 4. Write back to disk
  fs.writeFileSync(p, buf);
  console.log(`${name}: old peak=${oldPeakDb} dB -> new peak=-1.50 dB (boosted by ${boostDb} dB / ${multiplier.toFixed(2)}x)`);
}
