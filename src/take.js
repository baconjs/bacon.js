// build-dependencies: core

Bacon.Observable.prototype.take = function(count) {
  if (count <= 0) { return Bacon.never(); }
  return withDesc(new Bacon.Desc(this, "take", [count]), this.withHandler(function(event) {
    if (!event.hasValue()) {
      return this.push(event);
    } else {
      count--;
      if (count > 0) {
        return this.push(event);
      } else {
        if (count === 0) { this.push(event); }
        this.push(endEvent());
        return Bacon.noMore;
      }
    }
  }));
};
