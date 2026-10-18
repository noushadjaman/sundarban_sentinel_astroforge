(function(){
  app.enableQE();
  var vtl = qe.project.getVideoTransitionList();
  var first = vtl[0];
  var props = [];
  for (var k in first) { props.push(k); }
  return JSON.stringify({
    type0: typeof first,
    isString: typeof first === 'string',
    value0: String(first),
    props: props
  });
})()
