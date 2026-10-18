(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  var qeC8 = qeTrack.getItemAt(8);
  
  var before = null;
  var seq = app.project.activeSequence;
  var c8 = seq.videoTracks[0].clips[8];
  for (var k = 0; k < c8.components.numItems; k++) {
    if (c8.components[k].displayName === "Motion") {
      before = c8.components[k].properties[1].getValue();
    }
  }

  var called = false;
  try {
    qeC8.scaleToFrameSize();
    called = true;
  } catch(e) {
    called = e.message;
  }

  var after = null;
  for (var k = 0; k < c8.components.numItems; k++) {
    if (c8.components[k].displayName === "Motion") {
      after = c8.components[k].properties[1].getValue();
    }
  }

  return JSON.stringify({
    beforeScale: before,
    calledScaleToFrameSize: called,
    afterScale: after
  });
})()
