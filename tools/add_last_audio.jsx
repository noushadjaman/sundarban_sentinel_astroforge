(function(){
  try {
    var seq = app.project.activeSequence;
    var a2 = seq.audioTracks[1]; // Audio Track 2 (A2)
    
    function findItem(name) {
      for (var i = 0; i < app.project.rootItem.children.numItems; i++) {
        if (app.project.rootItem.children[i].name === name) return app.project.rootItem.children[i];
      }
      return null;
    }

    var audioItem = findItem('sundarban_bg.mp3');
    if (!audioItem) return JSON.stringify({ error: 'sundarban_bg.mp3 not found' });

    // Check if there are already clips near 118-120s on A2 and remove them first
    for (var i = a2.clips.numItems - 1; i >= 0; i--) {
      var c = a2.clips[i];
      if (c.start.seconds >= 115.0) {
        c.remove(false, false);
      }
    }

    // Set source range 10.0s to 12.0s
    audioItem.setInPoint(10.0, 4);
    audioItem.setOutPoint(12.0, 4);
    
    a2.overwriteClip(audioItem, 118.0);
    
    var newClip = a2.clips[a2.clips.numItems - 1];
    newClip.start = _makeTime(118.0);
    newClip.end = _makeTime(120.0);

    for (var compIdx = 0; compIdx < newClip.components.numItems; compIdx++) {
      if (newClip.components[compIdx].displayName.toLowerCase() === 'volume') {
        var prop = newClip.components[compIdx].properties[1]; // Level
        prop.setTimeVarying(false);
        prop.setTimeVarying(true);
        
        prop.addKey(_makeTime(0.0));
        prop.setValueAtKey(_makeTime(0.0), 0.0, true);
        
        prop.addKey(_makeTime(0.3));
        prop.setValueAtKey(_makeTime(0.3), 0.18, true);

        prop.addKey(_makeTime(1.3));
        prop.setValueAtKey(_makeTime(1.3), 0.18, true);

        prop.addKey(_makeTime(2.0));
        prop.setValueAtKey(_makeTime(2.0), 0.0, true);
        break;
      }
    }

    seq.setPlayerPosition(_makeTime(118.0).ticks);
    app.project.save();

    return JSON.stringify({
      success: true,
      numA2Clips: a2.clips.numItems,
      newClip: {
        name: newClip.name,
        start: newClip.start.seconds,
        end: newClip.end.seconds,
        duration: newClip.duration.seconds
      }
    });
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
