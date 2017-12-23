// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapEvent = function() {
    return this.flatMap_(
        makeSpawner(arguments), 
        new Bacon.Desc(this, "flatMapEvent", arguments), 
        {mapError: true}
    )
};