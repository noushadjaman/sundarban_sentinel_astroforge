(function(){
  try {
    app.enableQE();
    var qeSeq = qe.project.getActiveSequence();
    var qeTrack = qeSeq.getVideoTrackAt(0);
    var clip6 = qeTrack.getItemAt(6); // end of clip 6 is 44.0s, entering 2nd drone shot!
    
    var vtl = qe.project.getVideoTransitionList();
    var tObj = null;
    for (var i = 0; i < vtl.length; i++) {
      if (vtl[i].name === "Dip to Black") {
        tObj = vtl[i];
        break;
      }
    }
    if (!tObj) {
      for (var i = 0; i < vtl.length; i++) {
        if (vtl[i].name === "Cross Dissolve") {
          tObj = vtl[i];
          break;
        }
      }
    }

    var added = false;
    try {
      clip6.addTransition(tObj, true, "end");
      added = "called with end";
    } catch(e1) {
      try {
        clip6.addTransition(tObj);
        added = "called with 1 arg";
      } catch(e2) {
        added = "err: " + e1.message + " / " + e2.message;
      }
    }

    return JSON.stringify({
      clip6Name: clip6.name,
      transitionFound: tObj ? tObj.name : null,
      result: added,
      newNumTransitions: qeTrack.numTransitions
    });
  } catch(err) {
    return JSON.stringify({ error: err.toString(), line: err.line });
  }
})()
