import "./map";
import "./skipduplicates";
import Observable from "./observable";
import { Property } from "./observable";
/** @hidden */
export default function awaiting(src: Observable<any>, other: Observable<any>): Property<boolean>;
