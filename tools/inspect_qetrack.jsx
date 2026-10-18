(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  
  var trackProps = [];
  for (var k in qeTrack) { trackProps.push(k); }

  var seqProps = [];
  for (var s in qeSeq) { seqProps.push(s); }

  return JSON.stringify({
    trackProps: trackProps,
    seqProps: seqProps
  }, null, 2);
})()
