(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  var clip6 = qeTrack.getItemAt(6);
  
  return JSON.stringify({
    typeofAddTransition: typeof clip6.addTransition,
    typeofTrackAddTransition: typeof qeTrack.addTransition,
    numTransitions: qeTrack.numTransitions
  });
})()
