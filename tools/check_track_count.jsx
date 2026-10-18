(function(){
  var seq = app.project.activeSequence;
  return JSON.stringify({
    numAudioTracks: seq.audioTracks.numTracks,
    numItems: seq.audioTracks.numItems,
    numVideoTracks: seq.videoTracks.numTracks
  });
})()
