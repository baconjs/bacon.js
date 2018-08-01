import { Transformer } from "./transform";
/** @hidden */
export default function doActionT<V>(f: (V: any) => any): Transformer<V, V>;
