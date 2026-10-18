(function(){
  app.enableQE();
  var trans = qe.project.getVideoTransitionList();
  var list = [];
  for (var i = 0; i < trans.numItems; i++) {
    list.push(trans[i].name);
  }
  var seq = app.project.activeSequence;
  var clips = [];
  for (var i = 0; i < seq.videoTracks[0].clips.numItems; i++) {
    var c = seq.videoTracks[0].clips[i];
    clips.push({ index: i, name: c.name, start: c.start.seconds, end: c.end.seconds });
  }
  return JSON.stringify({
    seq: seq.name,
    numTransitions: trans.numItems,
    transitions: list,
    clips: clips
  });
})()
