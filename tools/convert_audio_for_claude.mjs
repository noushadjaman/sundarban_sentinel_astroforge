import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const audioDir = path.resolve('project_assets/audio');
const downloadsDir = 'C:\\Users\\RAJ\\Downloads';

console.log('Converting downloaded tracks to MP3 and WAV for Premiere Pro...');

// 1. Uniq - Art of Silence (Ambient, emotive, documentary)
const uniqOgg = path.join(audioDir, 'uniq_art_of_silence_v2.ogg');
const uniqMp3 = path.join(audioDir, 'sundarban_ambient_art_of_silence.mp3');

// 2. Scott Buckley - The Long Dark (Neoclassical ambient piano & strings)
const scottOgg = path.join(audioDir, 'scott_buckley_the_long_dark.ogg');
const scottMp3 = path.join(audioDir, 'sundarban_nature_calm_scott_buckley.mp3');

// 3. Ready-made 20-second project-friendly version (with smooth 1.5s fade-in & 3.0s fade-out)
const trimmed20sMp3 = path.join(audioDir, 'sundarban_bg_20s.mp3');
const trimmed20sWav = path.join(audioDir, 'sundarban_bg_20s.wav');

try {
  console.log('Encoding Uniq MP3...');
  execSync(`"${ffmpegStatic}" -y -i "${uniqOgg}" -c:a libmp3lame -b:a 320k "${uniqMp3}"`, { stdio: 'inherit' });

  console.log('Encoding Scott Buckley MP3...');
  execSync(`"${ffmpegStatic}" -y -i "${scottOgg}" -c:a libmp3lame -b:a 320k "${scottMp3}"`, { stdio: 'inherit' });

  console.log('Encoding 20s ready trimmed version with fade in/out...');
  execSync(`"${ffmpegStatic}" -y -ss 00:00:05 -i "${scottOgg}" -t 20 -af "afade=t=in:ss=0:d=1.5,afade=t=out:st=17:d=3.0,volume=-3dB" -c:a libmp3lame -b:a 320k "${trimmed20sMp3}"`, { stdio: 'inherit' });
  execSync(`"${ffmpegStatic}" -y -ss 00:00:05 -i "${scottOgg}" -t 20 -af "afade=t=in:ss=0:d=1.5,afade=t=out:st=17:d=3.0,volume=-3dB" "${trimmed20sWav}"`, { stdio: 'inherit' });

  // Copy to Downloads folder as requested by Claude
  if (fs.existsSync(downloadsDir)) {
    const targetBg = path.join(downloadsDir, 'sundarban_bg.mp3');
    const target20s = path.join(downloadsDir, 'sundarban_bg_20s.mp3');
    const targetFull = path.join(downloadsDir, 'sundarban_nature_calm.mp3');
    const targetSilence = path.join(downloadsDir, 'sundarban_art_of_silence.mp3');

    fs.copyFileSync(trimmed20sMp3, targetBg);
    fs.copyFileSync(trimmed20sMp3, target20s);
    fs.copyFileSync(scottMp3, targetFull);
    fs.copyFileSync(uniqMp3, targetSilence);

    console.log('Successfully copied to:', downloadsDir);
    console.log(' - C:\\Users\\RAJ\\Downloads\\sundarban_bg.mp3');
    console.log(' - C:\\Users\\RAJ\\Downloads\\sundarban_bg_20s.mp3');
    console.log(' - C:\\Users\\RAJ\\Downloads\\sundarban_nature_calm.mp3');
    console.log(' - C:\\Users\\RAJ\\Downloads\\sundarban_art_of_silence.mp3');
  }

  console.log('All audio processing complete!');
} catch(err) {
  console.error('Error during ffmpeg processing:', err);
}
