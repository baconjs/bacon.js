import "./combine";
import "./map";
import Observable from "./observable";
import { Property } from "./observable";
export declare function not(src: Observable<any>): Observable<boolean>;
export declare function and(left: Property<any>, right: Property<any>): Property<boolean>;
export declare function or(left: Property<any>, right: Property<any>): Property<boolean>;
