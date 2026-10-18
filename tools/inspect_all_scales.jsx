(function(){
  var seq = app.project.activeSequence;
  var v0 = seq.videoTracks[0];
  var res = [];
  for (var i = 0; i < v0.clips.numItems; i++) {
    var c = v0.clips[i];
    var scaleVal = null;
    for (var k = 0; k < c.components.numItems; k++) {
      if (c.components[k].displayName === "Motion") {
        for (var p = 0; p < c.components[k].properties.numItems; p++) {
          if (c.components[k].properties[p].displayName === "Scale") {
            scaleVal = c.components[k].properties[p].getValue();
            break;
          }
        }
      }
    }
    res.push({ i: i, name: c.name, scale: scaleVal });
  }
  return JSON.stringify(res, null, 2);
})()
