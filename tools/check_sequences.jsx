(function(){
  var res = {
    activeSeq: app.project.activeSequence ? app.project.activeSequence.name : null,
    sequences: []
  };
  for (var i = 0; i < app.project.sequences.numSequences; i++) {
    var s = app.project.sequences[i];
    res.sequences.push({
      index: i,
      name: s.name,
      numVTracks: s.videoTracks.numTracks,
      numATracks: s.audioTracks.numTracks,
      a1Clips: s.audioTracks[0].clips.numItems,
      a2Clips: s.audioTracks[1].clips.numItems
    });
  }
  return JSON.stringify(res, null, 2);
})()
