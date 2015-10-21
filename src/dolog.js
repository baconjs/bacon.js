// build-dependencies: observable

Bacon.Observable.prototype.doLog = function(...args) {
  return withDesc(new Bacon.Desc(this, "doLog", args), this.withHandler(function(event) {
    if (typeof console !== "undefined" && console !== null && typeof console.log === "function") {
      console.log(...args, event.log());
    }
    return this.push(event);
  })
  );
};
