// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapEvent = function() {
    return flatMap_(this, makeSpawner(arguments), new Bacon.Desc(this, "flatMapEvent", arguments), {forEvents: true})
};