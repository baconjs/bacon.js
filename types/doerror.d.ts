import { Transformer } from "./transform";
export default function doErrorT<V>(f: Function): Transformer<V, V>;
