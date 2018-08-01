import "./scan";
import "./filter";
import { Observable, Property } from "./observable";
/** @hidden */
export declare function slidingWindow<V>(src: Observable<V>, maxValues: number, minValues?: number): Property<V[]>;
