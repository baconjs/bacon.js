import { Transformer } from "./types";
import { isEnd } from "./event";

export default function doEndT<V>(f: Function): Transformer<V, V> {
  return (event, sink) => {
    if (isEnd(event)) { f() }
    return sink(event)
  }
}