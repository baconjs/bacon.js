import { EventStream } from "./observable";
import { End } from "./event";
import { EventSink } from "./types";
export declare type DelayFunction = (any: any) => any;
/** @hidden */
export declare function bufferWithTime<V>(src: EventStream<V>, delay: number | DelayFunction): EventStream<V>;
/** @hidden */
export declare function bufferWithCount<V>(src: EventStream<V>, count: number): EventStream<V>;
/** @hidden */
export declare function bufferWithTimeOrCount<V>(src: EventStream<V>, delay?: number | DelayFunction, count?: number): EventStream<V>;
declare class Buffer<V> {
    constructor(onFlush: any, onInput: any, delay: any);
    delay: DelayFunction;
    onInput: BufferHandler<V>;
    onFlush: BufferHandler<V>;
    push: EventSink<V>;
    scheduled: number | null;
    end: End<V> | undefined;
    values: V[];
    flush(): any;
    schedule(): any;
}
interface BufferHandler<V> {
    (buffer: Buffer<V>): any;
}
/** @hidden */
export declare function buffer<V>(src: EventStream<V>, delay?: number | DelayFunction, onInput?: BufferHandler<V>, onFlush?: BufferHandler<V>): EventStream<V>;
export {};
