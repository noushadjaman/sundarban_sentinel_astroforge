(function(){
  try {
    app.enableQE();
    var seq = app.project.activeSequence;
    var settings = seq.getSettings();
    var v0 = seq.videoTracks[0];
    
    var info = {
      seqWidth: settings.videoFrameWidth,
      seqHeight: settings.videoFrameHeight,
      clips: []
    };

    var qeSeq = qe.project.getActiveSequence();
    var qeTrack = qeSeq.getVideoTrackAt(0);

    for (var i = 8; i <= 12; i++) {
      if (i < v0.clips.numItems) {
        var c = v0.clips[i];
        var qeC = qeTrack.getItemAt(i);
        
        var curScale = null;
        var curPos = null;
        var scaleProp = null;
        var posProp = null;

        for (var k = 0; k < c.components.numItems; k++) {
          if (c.components[k].displayName === "Motion") {
            for (var p = 0; p < c.components[k].properties.numItems; p++) {
              var prop = c.components[k].properties[p];
              if (prop.displayName === "Scale") {
                scaleProp = prop;
                curScale = prop.getValue();
              }
              if (prop.displayName === "Position") {
                posProp = prop;
                curPos = prop.getValue();
              }
            }
          }
        }

        info.clips.push({
          i: i,
          name: c.name,
          scale: curScale,
          pos: curPos
        });
      }
    }

    return JSON.stringify(info, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
