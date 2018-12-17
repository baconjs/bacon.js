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
/**
 *  Options object for [Bacon.retry](../globals.html#retry).
 */
export interface RetryOptions<V> {
    /**
     * Required. A function that produces an Observable. The function gets attempt number (starting from zero) as its argument.
     */
    source: (attemptNumber: number) => Observable<V>;
    /**
     * Required. The number of times to retry the `source` function _in addition to the initial attempt_. The default value is 0 (zero) for retrying indefinitely.
     */
    retries?: number;
    /**
     *  Optional. A function that returns the time in milliseconds to wait before retrying. Defaults to `0`. The function is given a context object with the keys ```error``` (the error that occurred) and `retriesDone` (the number of retries already performed) to help determine the appropriate delay e.g. for an incremental backoff.
     */
    delay?(context: RetryContext): number;
    /**
     * Optional. A function returning `true` to continue retrying, `false` to stop. Defaults to `true`. The error that occurred is given as a parameter. For example, there is usually no reason to retry a 404 HTTP error, whereas a 500 or a timeout might work on the next attempt.
     */
    isRetryable?(error: any): boolean;
}
/**
 Used to retry the call when there is an [`Error`](classes/error.html) event in the stream produced by the `source` function.

 ```js
 var triggeringStream, ajaxCall // <- ajaxCall gives Errors on network or server errors
 ajaxResult = triggeringStream.flatMap(function(url) {
    return Bacon.retry({
        source: function(attemptNumber) { return ajaxCall(url) },
        retries: 5,
        isRetryable: function (error) { return error.httpStatusCode !== 404; },
        delay: function(context) { return 100; } // Just use the same delay always
    })
})
 ```
 * @param options (click for details)
 */
export default function retry<V>(options: RetryOptions<V>): EventStream<V>;
