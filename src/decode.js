// build-dependencies: combinetemplate

Bacon.Observable.prototype.decode = function(cases) {
  return withDesc(
    new Bacon.Desc(this, "decode", [cases]),
    this.combine(Bacon.combineTemplate(cases), (key, values) => values[key])
  );
};
