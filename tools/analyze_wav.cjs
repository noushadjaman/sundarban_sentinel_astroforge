const fs = require('fs');

const file = 'F:/sundarbansanetile/videoedit/Adobe Premiere Pro Captured and Generated/video/Audio 1_6.wav';
const buf = fs.readFileSync(file);

// WAV 16-bit or 24-bit PCM / float
// Find 'data' chunk
let pos = 12;
let dataOffset = 0;
let dataLength = 0;
let channels = 2;
let sampleRate = 48000;
let bitsPerSample = 16;
let formatTag = 1;

while (pos < buf.length - 8) {
  const chunkId = buf.toString('ascii', pos, pos + 4);
  const chunkSize = buf.readUInt32LE(pos + 4);
  if (chunkId === 'fmt ') {
    formatTag = buf.readUInt16LE(pos + 8);
    channels = buf.readUInt16LE(pos + 10);
    sampleRate = buf.readUInt32LE(pos + 12);
    bitsPerSample = buf.readUInt16LE(pos + 22);
  } else if (chunkId === 'data') {
    dataOffset = pos + 8;
    dataLength = chunkSize;
    break;
  }
  pos += 8 + chunkSize;
}

console.log({ channels, sampleRate, bitsPerSample, formatTag, dataLength });

let maxPeak = 0;
let sumSq = 0;
let count = 0;

if (bitsPerSample === 16) {
  for (let i = dataOffset; i < dataOffset + dataLength; i += 2) {
    const val = Math.abs(buf.readInt16LE(i));
    if (val > maxPeak) maxPeak = val;
    sumSq += val * val;
    count++;
  }
  const peakNorm = maxPeak / 32768;
  const rms = Math.sqrt(sumSq / count) / 32768;
  const peakDb = 20 * Math.log10(peakNorm);
  const rmsDb = 20 * Math.log10(rms);
  console.log({ maxPeak, peakNorm: peakNorm.toFixed(4), peakDb: peakDb.toFixed(2), rmsDb: rmsDb.toFixed(2) });
} else if (bitsPerSample === 32 && formatTag === 3) {
  for (let i = dataOffset; i < dataOffset + dataLength; i += 4) {
    const val = Math.abs(buf.readFloatLE(i));
    if (val > maxPeak) maxPeak = val;
    sumSq += val * val;
    count++;
  }
  const peakDb = 20 * Math.log10(maxPeak);
  const rmsDb = 20 * Math.log10(Math.sqrt(sumSq / count));
  console.log({ maxPeak: maxPeak.toFixed(4), peakDb: peakDb.toFixed(2), rmsDb: rmsDb.toFixed(2) });
}
