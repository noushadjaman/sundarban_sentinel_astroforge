const fs = require('fs');

const files = [
  "F:/sundarbansanetile/slide_topic_1_offline_terminal.png",
  "F:/sundarbansanetile/slide_topic_2_edge_ai_species.png",
  "F:/sundarbansanetile/slide_topic_3_illegal_nets_deterrence.png",
  "F:/sundarbansanetile/slide_topic_4_nasa_deforestation.png",
  "F:/sundarbansanetile/slide_topic_5_grameenphone_sync.png"
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const b = fs.readFileSync(f);
    const w = b.readUInt32BE(16);
    const h = b.readUInt32BE(20);
    console.log(`${f}: ${w} x ${h}`);
  } else {
    console.log(`${f}: NOT FOUND`);
  }
}
