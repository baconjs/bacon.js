import { Transformer } from "./transform";
import { isError } from "./event";

/** @hidden */
export default function doErrorT<V>(f: Function): Transformer<V, V> {
  return (event, sink) => {
    if (isError(event)) { f(event.error); }
    return sink(event)
  }
}