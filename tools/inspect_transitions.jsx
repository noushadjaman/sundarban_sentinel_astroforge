(function(){
  app.enableQE();
  var res = {};
  try {
    var vtl = qe.project.getVideoTransitionList();
    res.type = typeof vtl;
    res.numItems = vtl ? vtl.numItems : null;
    res.length = vtl ? vtl.length : null;
    if (vtl && vtl.numItems) {
      var sample = [];
      for (var i = 0; i < Math.min(vtl.numItems, 30); i++) {
        sample.push(vtl[i].name);
      }
      res.sample = sample;
    }
  } catch(e) {
    res.error = e.message;
  }
  return JSON.stringify(res, null, 2);
})()
