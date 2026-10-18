(function(){
  app.enableQE();
  var qeSeq = qe.project.getActiveSequence();
  var qeTrack = qeSeq.getVideoTrackAt(0);
  var clip6 = qeTrack.getItemAt(6); // dhaka_tribune_tiger_carcass_landscape_4k.png (40s - 44s)
  var clip7 = qeTrack.getItemAt(7); // videoplayback.mp4 (44s - 50s)
  
  var vtl = qe.project.getVideoTransitionList();
  function findTrans(name) {
    for (var i = 0; i < vtl.length; i++) {
      if (vtl[i].name === name) return vtl[i];
    }
    return null;
  }

  var methods = [];
  for (var m in clip6) {
    methods.push(m);
  }

  return JSON.stringify({
    clip6Name: clip6.name,
    clip7Name: clip7.name,
    clip6Methods: methods
  }, null, 2);
})()
