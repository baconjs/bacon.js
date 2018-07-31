import { Transformer } from "./transform";

/** @hidden */
export default function doLogT<V>(args: any[]): Transformer<V, V> {
  return (event, sink) => {
    if (typeof console !== "undefined" && console !== null && typeof console.log === "function") {
      console.log(...args.concat([event.log()]));
    }
    return sink(event)
  }
}