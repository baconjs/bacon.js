import { Transformer } from "./transform";
/** @hidden */
export default function doActionT<V>(f: (value: V) => any): Transformer<V, V>;
