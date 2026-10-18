(function(){
  var seq = app.project.activeSequence;
  var v0 = seq.videoTracks[0];
  var list = [];
  for (var i = 0; i < v0.clips.numItems; i++) {
    var c = v0.clips[i];
    var scale = null;
    var pos = null;
    for (var k = 0; k < c.components.numItems; k++) {
      if (c.components[k].displayName === "Motion") {
        for (var p = 0; p < c.components[k].properties.numItems; p++) {
          var prop = c.components[k].properties[p];
          if (prop.displayName === "Scale") scale = prop.getValue();
          if (prop.displayName === "Position") pos = prop.getValue();
        }
      }
    }
    list.push({ i: i, name: c.name, scale: scale, pos: pos });
  }
  return JSON.stringify(list, null, 2);
})()
