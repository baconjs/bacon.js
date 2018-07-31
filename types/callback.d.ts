import { EventStream } from "./observable";
export declare function fromCallback<V>(f: any, ...args: any[]): EventStream<V>;
export declare function fromNodeCallback<V>(f: any, ...args: any[]): EventStream<V>;
