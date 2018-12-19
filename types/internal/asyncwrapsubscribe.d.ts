import { Subscribe } from "../types";
import { Observable } from "../observable";
/** @hidden */
export default function asyncWrapSubscribe<V>(obs: Observable<V>, subscribe: Subscribe<V>): Subscribe<V>;
