# build-dependencies: observable, property, combine

Bacon.Observable :: not = -> withDesc(new Bacon.Desc(this, "not", []), @map((x) -> !x))

Bacon.Property :: and = (other) -> withDesc(new Bacon.Desc(this, "and", [other]), @combine(other, (x, y) -> x and y))

Bacon.Property :: or = (other) -> withDesc(new Bacon.Desc(this, "or", [other]), @combine(other, (x, y) -> x or y))
