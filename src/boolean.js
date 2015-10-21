// build-dependencies: observable, property, combine

Bacon.Observable.prototype.not = function() { return withDesc(new Bacon.Desc(this, "not", []), this.map(function(x) { return !x; })); };

Bacon.Property.prototype.and = function(other) { return withDesc(new Bacon.Desc(this, "and", [other]), this.combine(other, function(x, y) { return x && y; })); };

Bacon.Property.prototype.or = function(other) { return withDesc(new Bacon.Desc(this, "or", [other]), this.combine(other, function(x, y) { return x || y; })); };
