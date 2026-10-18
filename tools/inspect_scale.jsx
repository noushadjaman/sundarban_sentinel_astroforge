(function(){
  var seq = app.project.activeSequence;
  var v0 = seq.videoTracks[0];
  var c8 = v0.clips[8];
  
  var motionComp = null;
  var compList = [];
  for (var i = 0; i < c8.components.numItems; i++) {
    var comp = c8.components[i];
    var propNames = [];
    for (var j = 0; j < comp.properties.numItems; j++) {
      propNames.push(comp.properties[j].displayName);
    }
    compList.push({ name: comp.displayName, matchName: comp.matchName, props: propNames });
    if (comp.displayName === "Motion") {
      motionComp = comp;
    }
  }

  var scaleProp = null;
  if (motionComp) {
    for (var j = 0; j < motionComp.properties.numItems; j++) {
      if (motionComp.properties[j].displayName === "Scale") {
        scaleProp = motionComp.properties[j];
        break;
      }
    }
  }

  var currentScale = scaleProp ? scaleProp.getValue() : null;
  var hasSetScale = typeof c8.setScaleToFrameSize === 'function';

  return JSON.stringify({
    clip8Name: c8.name,
    hasSetScaleToFrameSize: hasSetScale,
    currentScale: currentScale,
    components: compList
  });
})()
