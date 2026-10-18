(function(){
  try {
    app.enableQE();
    var seq = app.project.activeSequence;
    var v0 = seq.videoTracks[0];
    
    // 1. Scale the 5 app slides (clips 8 to 12) to 200% to fill 4K screen
    var scaledClips = [];
    for (var i = 8; i <= 12; i++) {
      if (i < v0.clips.numItems) {
        var c = v0.clips[i];
        for (var compIdx = 0; compIdx < c.components.numItems; compIdx++) {
          var comp = c.components[compIdx];
          if (comp.displayName === "Motion") {
            for (var propIdx = 0; propIdx < comp.properties.numItems; propIdx++) {
              var p = comp.properties[propIdx];
              if (p.displayName === "Scale") {
                p.setValue(200.0, true);
                scaledClips.push({ index: i, name: c.name, scale: 200 });
                break;
              }
            }
          }
        }
      }
    }

    // 2. Add transition before 2nd drone shot (between clip 6 and clip 7 at 44.0s)
    var qeSeq = qe.project.getActiveSequence();
    var qeTrack = qeSeq.getVideoTrackAt(0);
    var clip6 = qeTrack.getItemAt(6);
    
    var dipToBlack = qe.project.getVideoTransitionByName("Dip to Black");
    var crossDissolve = qe.project.getVideoTransitionByName("Cross Dissolve");
    var filmDissolve = qe.project.getVideoTransitionByName("Film Dissolve");

    var vibeTrans = dipToBlack || filmDissolve || crossDissolve;
    var transResult = "none";
    if (clip6 && vibeTrans) {
      try {
        clip6.addTransition(vibeTrans, true, "end");
        transResult = "Dip to Black added at end of clip 6 (44s)";
      } catch(e1) {
        try {
          clip6.addTransition(vibeTrans);
          transResult = "Dip to Black added (1 arg)";
        } catch(e2) {
          transResult = "err: " + e1.message + " / " + e2.message;
        }
      }
    }

    // 3. Add transitions between the 5 slides (between clips 8, 9, 10, 11, 12)
    var slideTransResult = [];
    var dissolveTrans = crossDissolve || filmDissolve;
    if (dissolveTrans) {
      for (var s = 8; s <= 11; s++) {
        try {
          var sc = qeTrack.getItemAt(s);
          if (sc) {
            sc.addTransition(dissolveTrans, true, "end");
            slideTransResult.push("Added transition to clip " + s);
          }
        } catch(err) {
          slideTransResult.push("Clip " + s + " err: " + err.message);
        }
      }
    }

    // Set playhead to 44s to view the transition
    seq.setPlayerPosition(_makeTime(43.9).ticks);
    app.project.save();

    return JSON.stringify({
      success: true,
      scaledClips: scaledClips,
      droneBridgeTransition: transResult,
      slideTransitions: slideTransResult
    }, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
