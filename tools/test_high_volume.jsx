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

    if (!prop) return JSON.stringify({ error: "Level property not found" });

    // Test setting to 3.5 (+10.8 dB)
    prop.setValue(3.5, true);
    var v3_5 = prop.getValue();

    // Test setting to 5.0 (+14 dB)
    prop.setValue(5.0, true);
    var v5_0 = prop.getValue();

    return JSON.stringify({
      set3_5_result: v3_5,
      set5_0_result: v5_0
    });
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
