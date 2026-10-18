(function(){
  var seq = app.project.activeSequence;
  var v0 = seq.videoTracks[0];
  var res = [];
  for (var i = 8; i <= 12; i++) {
    var c = v0.clips[i];
    var pItem = c.projectItem;
    var fPath = pItem ? pItem.getMediaPath() : null;
    res.push({
      index: i,
      name: c.name,
      mediaPath: fPath
    });
  }
  return JSON.stringify(res, null, 2);
})()
