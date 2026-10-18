(function(){
  try {
    function getCopySeq() {
      for (var s = 0; s < app.project.sequences.numSequences; s++) {
        if (app.project.sequences[s].name === "videoplayback Copy") {
          return app.project.sequences[s];
        }
      }
      return app.project.activeSequence;
    }

    var seq = getCopySeq();
    var outPath = "F:\\sundarbansanetile\\videoedit\\sundarban_sentinel_final.mp4";
    var preset = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2026\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr";

    var f = new File(preset);
    var presetExists = f.exists;

    return JSON.stringify({
      seqName: seq.name,
      presetExists: presetExists,
      encoderAvailable: typeof app.encoder !== 'undefined',
      exportDirectAvailable: typeof seq.exportAsMediaDirect === 'function'
    });
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
