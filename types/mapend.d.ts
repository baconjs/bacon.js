import { Transformer } from "./transform";
export default function mapEndT<V>(f: ((End: any) => V) | V): Transformer<V, V>;
