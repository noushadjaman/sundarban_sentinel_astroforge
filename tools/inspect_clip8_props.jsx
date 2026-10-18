(function(){
  var seq = app.project.activeSequence;
  var c8 = seq.videoTracks[0].clips[8];
  var props = [];
  for (var k = 0; k < c8.components.numItems; k++) {
    var comp = c8.components[k];
    for (var p = 0; p < comp.properties.numItems; p++) {
      var prop = comp.properties[p];
      props.push({ comp: comp.displayName, name: prop.displayName, val: prop.getValue() });
    }
  }
  return JSON.stringify(props, null, 2);
})()
