/* eslint no-console: 0 */
import Observable from "./observable";
import { Reply, more } from "./reply";

/** @hidden */
export default function log(args: any[], src: Observable<any>): void {
  src.subscribe(function(event): Reply {
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log(...args.concat([event.log()]));
    }
    return more
  })
}
