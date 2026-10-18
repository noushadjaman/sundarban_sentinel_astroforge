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

    var a1 = seq.audioTracks[0]; // Voice clips
    var a2 = seq.audioTracks[1]; // Music clips

    // 1. Boost all voice clips on A1 to 1.25 (+2 dB boost, loud and clear)
    var a1Boosted = [];
    for (var i = 0; i < a1.clips.numItems; i++) {
      var c = a1.clips[i];
      for (var k = 0; k < c.components.numItems; k++) {
        if (c.components[k].displayName.toLowerCase() === 'volume') {
          var prop = c.components[k].properties[1]; // Level
          prop.setTimeVarying(false);
          prop.setValue(1.25, true);
          a1Boosted.push({ name: c.name, level: 1.25 });
          break;
        }
      }
    }

    // 2. Boost Background music on A2 (intro 0-5s and outro 118-120s)
    if (a2.clips.numItems >= 1) {
      var introClip = a2.clips[0];
      for (var k = 0; k < introClip.components.numItems; k++) {
        if (introClip.components[k].displayName.toLowerCase() === 'volume') {
          var pIntro = introClip.components[k].properties[1];
          pIntro.setTimeVarying(false);
          pIntro.setTimeVarying(true);
          pIntro.addKey(_makeTime(0.0));
          pIntro.setValueAtKey(_makeTime(0.0), 0.0, true);
          pIntro.addKey(_makeTime(0.8));
          pIntro.setValueAtKey(_makeTime(0.8), 0.55, true); // loud & punchy intro music
          pIntro.addKey(_makeTime(3.0));
          pIntro.setValueAtKey(_makeTime(3.0), 0.55, true);
          pIntro.addKey(_makeTime(5.0));
          pIntro.setValueAtKey(_makeTime(5.0), 0.0, true);
          break;
        }
      }
    }

    if (a2.clips.numItems >= 2) {
      var outroClip = a2.clips[1];
      for (var k = 0; k < outroClip.components.numItems; k++) {
        if (outroClip.components[k].displayName.toLowerCase() === 'volume') {
          var pOutro = outroClip.components[k].properties[1];
          pOutro.setTimeVarying(false);
          pOutro.setTimeVarying(true);
          pOutro.addKey(_makeTime(0.0));
          pOutro.setValueAtKey(_makeTime(0.0), 0.0, true);
          pOutro.addKey(_makeTime(0.3));
          pOutro.setValueAtKey(_makeTime(0.3), 0.60, true); // loud & punchy outro music
          pOutro.addKey(_makeTime(1.4));
          pOutro.setValueAtKey(_makeTime(1.4), 0.60, true);
          pOutro.addKey(_makeTime(2.0));
          pOutro.setValueAtKey(_makeTime(2.0), 0.0, true);
          break;
        }
      }
    }

    app.project.save();

    // 3. Re-export the video with the boosted audio
    var outPath = "F:\\sundarbansanetile\\videoedit\\sundarban_sentinel_presentation.mp4";
    var preset = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2026\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr";
    
    var expResult = seq.exportAsMediaDirect(outPath, preset, app.encoder.ENCODE_ENTIRE);

    return JSON.stringify({
      success: true,
      a1ClipsBoosted: a1Boosted.length,
      a2ClipsUpdated: a2.clips.numItems,
      outPath: outPath,
      exportResult: expResult
    }, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
