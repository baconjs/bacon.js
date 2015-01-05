// build-dependencies: observable

Observable.prototype.toPromise = function () {
  return new Promise((resolve, reject) =>
    this.subscribe((event) => {
      if (event.hasValue()) { resolve(event.value()); }
      if (event.isError()) { reject(event.error); }
      if (event.isEnd()) { resolve(undefined); }
      // One event is enough
      return Bacon.noMore;
    }));
}
