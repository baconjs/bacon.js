// build-dependencies: core, withstatemachine

var equals = function(a, b) { return a === b; };

var isNone = function(object){
  return ((typeof object !== "undefined" && object !== null) ? object._isNone : false)
};

Bacon.Observable.prototype.skipDuplicates = function(isEqual = equals) {
  var desc = new Bacon.Desc(this, "skipDuplicates", []);
  return withDesc(desc, this.withStateMachine(None, function(prev, event) {
    if (!event.hasValue()) {
      return [prev, [event]];
    } else if (event.isInitial() || isNone(prev) || !isEqual(prev.get(), event.value)) {
      return [new Some(event.value), [event]];
    } else {
      return [prev, []];
    }
  }));
};
