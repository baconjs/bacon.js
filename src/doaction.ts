import { Transformer } from "./types";
import { hasValue } from "./event";

export default function doActionT<V>(f: (V) => any): Transformer<V, V> {
  return (event, sink) => {
    if (hasValue(event)) { f(event.value); }
    return sink(event)
  }
}