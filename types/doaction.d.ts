import { Transformer } from "./transform";
export default function doActionT<V>(f: (V: any) => any): Transformer<V, V>;
