# build-dependencies: observable, property, combine

Bacon.Observable :: not = -> withDescription(this, "not", @map((x) -> !x))

Bacon.Property :: and = (other) -> withDescription(this, "and", other, @combine(other, (x, y) -> x and y))

Bacon.Property :: or = (other) -> withDescription(this, "or", other, @combine(other, (x, y) -> x or y))
