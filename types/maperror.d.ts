import { Transformer } from "./transform";
export default function mapErrorT<V>(f: ((any: any) => V) | V): Transformer<V, V>;
