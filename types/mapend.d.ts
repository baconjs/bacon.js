import { End } from "./event";
import { Transformer } from "./transform";
/** @hidden */
export default function mapEndT<V>(f: ((end: End) => V) | V): Transformer<V, V>;
