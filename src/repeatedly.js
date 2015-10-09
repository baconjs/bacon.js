// build-dependencies: frompoll

Bacon.repeatedly = function(delay, values) {
  var index = 0;
  return withDesc(new Bacon.Desc(Bacon, "repeatedly", [delay, values]), Bacon.fromPoll(delay, function() { return values[index++ % values.length]; }));
};

