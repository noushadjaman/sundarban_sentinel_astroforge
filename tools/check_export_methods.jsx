(function(){
  var seq = app.project.activeSequence;
  var methods = [];
  for (var m in seq) {
    if (m.toLowerCase().indexOf("export") !== -1 || m.toLowerCase().indexOf("frame") !== -1) {
      methods.push(m);
    }
  }
  return JSON.stringify(methods);
})()
