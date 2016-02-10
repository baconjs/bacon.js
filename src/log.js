/* eslint no-console: 0 */
import Observable from "./observable";

Observable.prototype.log = function(...args) {
  this.subscribe(function(event) {
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log(...args.concat([event.log()]));
    }
  });
  return this;
};
