/* eslint no-console: 0 */
/* global console:true */
import { withDesc, Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.doLog = function(...args) {
  return withDesc(new Desc(this, "doLog", args), this.withHandler(function(event) {
    if (typeof console !== "undefined" && console !== null && typeof console.log === "function") {
      console.log(...args.concat([event.log()]));
    }
    return this.push(event);
  }));
};
