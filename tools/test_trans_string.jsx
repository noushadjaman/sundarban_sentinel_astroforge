(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  var clip6 = qeTrack.getItemAt(6);
  var before = qeTrack.numTransitions;
  
  var res = {};
  var methods = ["getVideoTransition", "getVideoTransitionByName", "getVideoTransitionItem"];
  for (var i = 0; i < methods.length; i++) {
    var m = methods[i];
    res[m] = typeof qe.project[m];
  }

  var transObj = null;
  if (typeof qe.project.getVideoTransitionByName === 'function') {
    transObj = qe.project.getVideoTransitionByName("Dip to Black");
  } else if (typeof qe.project.getVideoTransition === 'function') {
    transObj = qe.project.getVideoTransition("Dip to Black");
  }

  res.transObj = transObj ? String(transObj) : null;
  
  try {
    clip6.addTransition("Dip to Black");
    res.addByString = true;
  } catch(e) {
    res.addByString = e.message;
  }
  
  res.after = qeTrack.numTransitions;

  return JSON.stringify(res, null, 2);
})()
