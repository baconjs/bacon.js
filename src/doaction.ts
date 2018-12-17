import { Transformer } from "./transform";
import { hasValue } from "./event";

/** @hidden */
export default function doActionT<V>(f: (value: V) => any): Transformer<V, V> {
  return (event, sink) => {
    if (hasValue(event)) { f(event.value); }
    return sink(event)
  }
}
