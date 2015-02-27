// build-dependencies: observable
// build-dependencies: last

Observable.prototype.firstToPromise = function (PromiseCtr) {
  // Can't do in the global scope, as shim can be applied after Bacon is loaded.
  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = Promise;
    } else {
      throw new Exception("There isn't default Promise, use shim or parameter");
    }
  }

  return new PromiseCtr((resolve, reject) =>
    this.subscribe((event) => {
      if (event.hasValue()) { resolve(event.value()); }
      if (event.isError()) { reject(event.error); }
      // One event is enough
      return Bacon.noMore;
    }));
};

Observable.prototype.toPromise = function (PromiseCtr) {
  return this.last().firstToPromise(PromiseCtr);
};
