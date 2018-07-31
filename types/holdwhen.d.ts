import { EventStream, default as Observable, Property } from "./observable";
export declare function holdWhen<V>(src: Observable<V>, valve: Property<boolean>): EventStream<V>;
