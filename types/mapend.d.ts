import { Transformer } from "./transform";
/** @hidden */
export default function mapEndT<V>(f: ((End: any) => V) | V): Transformer<V, V>;
