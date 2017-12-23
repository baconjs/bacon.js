// build-dependencies: flatmap_

Bacon.Observable.prototype.flatMapEvent = function() {
    return this.flatMap_(
        makeSpawner(arguments), 
        {
            mapError: true,
            desc: new Bacon.Desc(this, "flatMapEvent", arguments)
        }
    )
};