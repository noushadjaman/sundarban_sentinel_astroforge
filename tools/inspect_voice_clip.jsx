(function(){
  try {
    app.enableQE();
    var seq = app.project.activeSequence;
    var a0 = seq.audioTracks[0]; // Track A1
    var clips = [];
    for (var i = 0; i < a0.clips.numItems; i++) {
      var c = a0.clips[i];
      var comps = [];
      for (var k = 0; k < c.components.numItems; k++) {
        comps.push(c.components[k].displayName);
      }
      clips.push({
        index: i,
        name: c.name,
        start: c.start.seconds,
        end: c.end.seconds,
        duration: c.duration.seconds,
        components: comps
      });
    }

    var aEffects = [];
    try {
      var ael = qe.project.getAudioEffectList();
      for (var j = 0; j < (ael.length || ael.numItems || 0); j++) {
        var eff = ael[j];
        aEffects.push(typeof eff === 'string' ? eff : (eff.name || String(eff)));
      }
    } catch(e) {
      aEffects.push("err: " + e.message);
    }

    return JSON.stringify({
      a1Clips: clips,
      numAudioEffects: aEffects.length,
      audioEffects: aEffects
    }, null, 2);
  } catch(err) {
    return JSON.stringify({ error: err.toString(), line: err.line });
  }
})()
