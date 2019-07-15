import "./combine";
import { Observable, Property } from "./observable";
export declare type FlattenedObservable<O> = O extends Observable<infer I> ? I : O;
export declare type DecodedValueOf<O> = FlattenedObservable<O[keyof O]>;
/** @hidden */
export declare function decode<T extends Record<any, any>>(src: Observable<keyof T>, cases: T): Property<DecodedValueOf<T>>;
export default decode;
