import Observable from "./observable";

Observable.prototype.log = function(...args) {
  this.subscribe(function(event) {
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log(...args, event.log());
    }
  });
  return this;
};
