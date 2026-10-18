(function(){
  try {
    function getCopySeq() {
      for (var s = 0; s < app.project.sequences.numSequences; s++) {
        if (app.project.sequences[s].name === "videoplayback Copy") {
          return app.project.sequences[s];
        }
      }
      return app.project.activeSequence;
    }

    var seq = getCopySeq();
    app.project.openSequence(seq.sequenceID);

    var a2 = seq.audioTracks[1]; // Audio Track 2 (A2)
    
    function findItem(name) {
      for (var i = 0; i < app.project.rootItem.children.numItems; i++) {
        if (app.project.rootItem.children[i].name === name) return app.project.rootItem.children[i];
      }
      return null;
    }

    var audioItem = findItem('sundarban_bg.mp3');
    if (!audioItem) return JSON.stringify({ error: 'sundarban_bg.mp3 not found' });

    // Remove any existing clips on A2 near 118-120s
    for (var i = a2.clips.numItems - 1; i >= 0; i--) {
      var c = a2.clips[i];
      if (c.start.seconds >= 115.0) {
        c.remove(false, false);
      }
    }

    // Place sundarban_bg.mp3 from 118.0s to 120.0s (last 2 seconds)
    audioItem.setInPoint(5.0, 4);
    audioItem.setOutPoint(7.0, 4);
    
    a2.overwriteClip(audioItem, 118.0);
    
    var newClip = a2.clips[a2.clips.numItems - 1];
    newClip.start = _makeTime(118.0);
    newClip.end = _makeTime(120.0);

    // Apply smooth keyframe envelope on the 2s clip
    for (var compIdx = 0; compIdx < newClip.components.numItems; compIdx++) {
      if (newClip.components[compIdx].displayName.toLowerCase() === 'volume') {
        var prop = newClip.components[compIdx].properties[1]; // Level
        prop.setTimeVarying(false);
        prop.setTimeVarying(true);
        
        // Keyframes:
        // t=0.0s -> level 0.0 (fade-in)
        // t=0.3s -> level 0.22 (gentle background music)
        // t=1.4s -> level 0.22
        // t=2.0s -> level 0.0 (fade to silence at 120.0s)
        prop.addKey(_makeTime(0.0));
        prop.setValueAtKey(_makeTime(0.0), 0.0, true);
        
        prop.addKey(_makeTime(0.3));
        prop.setValueAtKey(_makeTime(0.3), 0.22, true);

        prop.addKey(_makeTime(1.4));
        prop.setValueAtKey(_makeTime(1.4), 0.22, true);

        prop.addKey(_makeTime(2.0));
        prop.setValueAtKey(_makeTime(2.0), 0.0, true);
        break;
      }
    }

    seq.setPlayerPosition(_makeTime(118.0).ticks);
    app.project.save();

    var allClips = [];
    for (var j = 0; j < a2.clips.numItems; j++) {
      allClips.push({
        index: j,
        name: a2.clips[j].name,
        start: a2.clips[j].start.seconds,
        end: a2.clips[j].end.seconds,
        dur: a2.clips[j].duration.seconds
      });
    }

    return JSON.stringify({
      success: true,
      sequence: seq.name,
      a2Clips: allClips
    }, null, 2);
  } catch(e) {
    return JSON.stringify({ error: e.toString(), line: e.line });
  }
})()
