import Observable, { Property } from "./observable";
export declare type ObjectTemplate<O> = {
    [K in keyof O]: O[K] extends Observable<infer I> ? I : (O[K] extends Record<any, any> ? ObjectTemplate<O[K]> : (O[K] extends Array<infer I2> ? ArrayTemplate<I2> : O[K]));
};
export declare type ArrayTemplate<A> = Array<A extends Observable<infer I> ? I : (A extends Record<any, any> ? ObjectTemplate<A> : A)>;
export declare type CombinedTemplate<O> = O extends Record<any, any> ? ObjectTemplate<O> : (O extends Array<infer I> ? ArrayTemplate<I> : (O extends Observable<infer I2> ? I2 : O));
export default function combineTemplate<T>(template: T): Property<CombinedTemplate<T>>;
