import { EventStream, default as Observable, Property } from "./observable";
/** @hidden */
export declare function holdWhen<V>(src: Observable<V>, valve: Property<boolean>): EventStream<V>;
