(function(){
  app.enableQE();
  var vtl = qe.project.getVideoTransitionList();
  var names = [];
  for (var i = 0; i < vtl.length; i++) {
    var t = vtl[i];
    names.push(typeof t === 'string' ? t : (t.name || String(t)));
  }
  return JSON.stringify(names, null, 2);
})()
