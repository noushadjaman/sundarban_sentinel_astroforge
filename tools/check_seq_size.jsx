(function(){
  var seq = app.project.activeSequence;
  return JSON.stringify({
    horiz: seq.frameSizeHorizontal,
    vert: seq.frameSizeVertical
  });
})()
