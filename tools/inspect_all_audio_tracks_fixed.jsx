(function(){
  var seq = app.project.activeSequence;
  var res = [];
  for (var t = 0; t < seq.audioTracks.numTracks; t++) {
    var trk = seq.audioTracks[t];
    var cList = [];
    for (var c = 0; c < trk.clips.numItems; c++) {
      var clip = trk.clips[c];
      cList.push({
        cIndex: c,
        name: clip.name,
        start: clip.start.seconds,
        end: clip.end.seconds,
        dur: clip.duration.seconds
      });
    }
    res.push({
      trackIndex: t,
      trackName: trk.name,
      numClips: trk.clips.numItems,
      clips: cList
    });
  }
  return JSON.stringify(res, null, 2);
})()
