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
    app.project.openSequence(seq.sequenceID);

    var outPath = "F:\\sundarbansanetile\\videoedit\\sundarban_sentinel_presentation.mp4";
    
    // Choose preset: Match Source - H.264 High Bitrate or shareforreview-web1080
    var preset = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2026\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr";
    var f = new File(preset);
    if (!f.exists) {
      preset = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2026\\Settings\\Frame.io\\EncoderPresets\\shareforreview-web1080.epr";
    }

    var res = seq.exportAsMediaDirect(outPath, preset, app.encoder.ENCODE_ENTIRE);

    return JSON.stringify({
      success: true,
      seqName: seq.name,
      outPath: outPath,
      presetUsed: preset,
      exportReturn: res
    }, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
