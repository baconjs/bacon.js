/* eslint no-console: 0 */
import Observable from "./observable";

export default function log(args: any[], src: Observable<any>): void {
  src.subscribe(function(event) {
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log(...args.concat([event.log()]));
    }
  })
}
