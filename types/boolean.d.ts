import "./combine";
import "./map";
import Observable from "./observable";
import { Property } from "./observable";
/** @hidden */
export declare function not(src: Observable<any>): Observable<boolean>;
/** @hidden */
export declare function and(left: Property<any>, right: Property<any>): Property<boolean>;
/** @hidden */
export declare function or(left: Property<any>, right: Property<any>): Property<boolean>;
