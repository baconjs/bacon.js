import { Transformer } from "./transform";
/** @hidden */
export default function mapErrorT<V>(f: ((any: any) => V) | V): Transformer<V, V>;
