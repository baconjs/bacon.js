import { Transformer } from "./transform";
import { isEnd } from "./event";

/** @hidden */
export default function doEndT<V>(f: Function): Transformer<V, V> {
  return (event, sink) => {
    if (isEnd(event)) { f() }
    return sink(event)
  }
}