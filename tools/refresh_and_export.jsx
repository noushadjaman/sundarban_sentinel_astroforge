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

    var a1 = seq.audioTracks[0];
    var a2 = seq.audioTracks[1];

    // 1. Refresh media and ensure volume level is 1.0 (0 dB full unity)
    var refreshed = [];
    for (var i = 0; i < a1.clips.numItems; i++) {
      var c = a1.clips[i];
      if (c.projectItem && typeof c.projectItem.refreshMedia === 'function') {
        c.projectItem.refreshMedia();
      }
      for (var k = 0; k < c.components.numItems; k++) {
        if (c.components[k].displayName.toLowerCase() === 'volume') {
          var prop = c.components[k].properties[1]; // Level
          prop.setTimeVarying(false);
          prop.setValue(1.0, true);
          break;
        }
      }
      refreshed.push(c.name);
    }

    // 2. Set background music on A2
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
          pIntro.setValueAtKey(_makeTime(0.8), 0.65, true);
          pIntro.addKey(_makeTime(3.0));
          pIntro.setValueAtKey(_makeTime(3.0), 0.65, true);
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
          pOutro.setValueAtKey(_makeTime(0.3), 0.70, true);
          pOutro.addKey(_makeTime(1.4));
          pOutro.setValueAtKey(_makeTime(1.4), 0.70, true);
          pOutro.addKey(_makeTime(2.0));
          pOutro.setValueAtKey(_makeTime(2.0), 0.0, true);
          break;
        }
      }
    }

    app.project.save();

    // 3. Re-export
    var outPath = "F:\\sundarbansanetile\\videoedit\\sundarban_sentinel_presentation.mp4";
    var preset = "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2026\\Settings\\IngestPresets\\Transcode\\Match Source - H.264 High Bitrate.epr";
    
    var expResult = seq.exportAsMediaDirect(outPath, preset, app.encoder.ENCODE_ENTIRE);

    return JSON.stringify({
      success: true,
      refreshedClips: refreshed,
      outPath: outPath,
      exportResult: expResult
    }, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
