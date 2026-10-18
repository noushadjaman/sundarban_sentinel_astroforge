(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  var res = [];
  for (var i = 0; i < qeTrack.numTransitions; i++) {
    var t = qeTrack.getTransitionAt(i);
    var info = {};
    for (var k in t) { info[k] = t[k]; }
    res.push(info);
  }
  return JSON.stringify(res, null, 2);
})()
