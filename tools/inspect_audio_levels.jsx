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
    var a1 = seq.audioTracks[0]; // Voiceover track
    var a2 = seq.audioTracks[1]; // Background music track
    
    var res = {
      a1Clips: [],
      a2Clips: []
    };

    for (var i = 0; i < a1.clips.numItems; i++) {
      var c = a1.clips[i];
      var volComp = null;
      var levelVal = null;
      for (var k = 0; k < c.components.numItems; k++) {
        if (c.components[k].displayName.toLowerCase() === 'volume') {
          volComp = c.components[k];
          levelVal = volComp.properties[1].getValue();
        }
      }
      res.a1Clips.push({
        index: i,
        name: c.name,
        level: levelVal
      });
    }

    for (var j = 0; j < a2.clips.numItems; j++) {
      var c2 = a2.clips[j];
      var levelVal2 = null;
      for (var k = 0; k < c2.components.numItems; k++) {
        if (c2.components[k].displayName.toLowerCase() === 'volume') {
          levelVal2 = c2.components[k].properties[1].getValue();
        }
      }
      res.a2Clips.push({
        index: j,
        name: c2.name,
        level: levelVal2
      });
    }

    return JSON.stringify(res, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
