import { Transformer } from "./transform";
/** @hidden */
export default function mapErrorT<V>(f: ((error: any) => V) | V): Transformer<V, V>;
