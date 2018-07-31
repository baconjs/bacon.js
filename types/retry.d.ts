import "./concat";
import "./endonerror";
import "./filter";
import "./flatmap";
import Observable from "./observable";
import { EventStream } from "./observable";
export interface RetryContext {
    error: any;
    retriesDone: number;
}
export interface RetryOptions<V> {
    source: (number: any) => Observable<V>;
    retries?: number;
    delay?(context: RetryContext): number;
    isRetryable?(error: any): boolean;
}
export default function retry<V>(options: RetryOptions<V>): EventStream<V>;
