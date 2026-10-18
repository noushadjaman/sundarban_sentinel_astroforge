(function(){
  var seq = app.project.activeSequence;
  var a1 = seq.audioTracks[1]; // Audio Track 2 (A2)
  var clips = [];
  for (var i = 0; i < a1.clips.numItems; i++) {
    var c = a1.clips[i];
    var keys = [];
    for (var k = 0; k < c.components.numItems; k++) {
      if (c.components[k].displayName.toLowerCase() === 'volume') {
        var prop = c.components[k].properties[1]; // Level
        try {
          var kTimes = prop.getKeys();
          for (var t = 0; t < kTimes.length; t++) {
            keys.push({ time: kTimes[t].seconds, val: prop.getValueAtTime(kTimes[t]) });
          }
        } catch(e) { keys.push("err: " + e.message); }
      }
    }
    clips.push({
      index: i,
      name: c.name,
      start: c.start.seconds,
      end: c.end.seconds,
      duration: c.duration.seconds,
      keys: keys
    });
  }
  return JSON.stringify(clips, null, 2);
})()
