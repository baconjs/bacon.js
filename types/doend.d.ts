import { Transformer } from "./transform";
export default function doEndT<V>(f: Function): Transformer<V, V>;
