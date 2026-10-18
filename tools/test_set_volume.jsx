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
    var a1 = seq.audioTracks[0];
    var c0 = a1.clips[0];
    
    var prop = null;
    for (var k = 0; k < c0.components.numItems; k++) {
      if (c0.components[k].displayName.toLowerCase() === 'volume') {
        prop = c0.components[k].properties[1];
        break;
      }
    }

    var beforeVal = prop ? prop.getValue() : null;
    if (prop) {
      prop.setValue(1.0, true);
    }
    var afterVal = prop ? prop.getValue() : null;

    return JSON.stringify({
      clipName: c0.name,
      before: beforeVal,
      after: afterVal
    });
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
