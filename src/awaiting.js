// build-dependencies: observable, groupsimultaneous, skipduplicates, map

Bacon.Observable.prototype.awaiting = function(other) {
  var desc = new Bacon.Desc(this, "awaiting", [other]);
  return withDesc(desc, Bacon.groupSimultaneous(this, other)
    .map((values) => values[1].length === 0)
    .toProperty(false).skipDuplicates());
};
