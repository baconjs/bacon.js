// build-dependencies: filter
Observable.prototype.errors = function() { return withDesc(new Bacon.Desc(this, "errors", []), this.filter(function() { return false; })); };
