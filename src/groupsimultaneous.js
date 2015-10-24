// build-dependencies: source
// build-dependencies: when

Bacon.groupSimultaneous = function(...streams) {
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  var sources = (() => {
    var result = [];
    for (var i = 0, s; i < streams.length; i++) {
      s = streams[i];
      result.push(new BufferingSource(s));
    }
    return result;
  })();
  return withDesc(new Bacon.Desc(Bacon, "groupSimultaneous", streams), Bacon.when(sources, (function(...xs) { return xs; })));
};
