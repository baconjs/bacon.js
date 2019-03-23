import { EventStream } from "./observable";
import { Source } from "./internal/source";
import Observable, { ObservableConstructor } from "./observable";
import { Property } from "./observable";
export declare type ObservableOrSource<V> = Observable<V> | Source<any, V>;
/**
 *  Join pattern consisting of a single EventStream and a mapping function.
 */
export declare type Pattern1<I1, O> = [ObservableOrSource<I1>, O | ((a: I1) => O)];
/**
 *  Join pattern consisting of a 2 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export declare type Pattern2<I1, I2, O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, O | ((a: I1, b: I2) => O)];
/**
 *  Join pattern consisting of a 3 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export declare type Pattern3<I1, I2, I3, O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, O | ((a: I1, b: I2, c: I3) => O)];
/**
 *  Join pattern consisting of a 4 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export declare type Pattern4<I1, I2, I3, I4, O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, O | ((a: I1, b: I2, c: I3, d: I4) => O)];
/**
 *  Join pattern consisting of a 5 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export declare type Pattern5<I1, I2, I3, I4, I5, O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, O | ((a: I1, b: I2, c: I3, d: I4, e: I5) => O)];
/**
 *  Join pattern consisting of a 6 Observables and a combinator function. At least one of the Observables must be an EventStream.
 */
export declare type Pattern6<I1, I2, I3, I4, I5, I6, O> = [ObservableOrSource<I1>, ObservableOrSource<I1>, ObservableOrSource<I3>, ObservableOrSource<I4>, ObservableOrSource<I5>, ObservableOrSource<I6>, O | ((a: I1, b: I2, c: I3, d: I4, e: I5, f: I6) => O)];
/** @hidden */
export declare type RawPattern = [AnyObservableOrSource[], AnyFunction];
/**
 *  Join pattern type, allowing up to 6 sources per pattern.
 */
export declare type Pattern<O> = Pattern1<any, O> | Pattern2<any, any, O> | Pattern3<any, any, any, O> | Pattern4<any, any, any, any, O> | Pattern5<any, any, any, any, any, O> | Pattern6<any, any, any, any, any, any, O> | RawPattern;
/** @hidden */
export declare type AnySource = Source<any, any>;
/** @hidden */
export declare type AnyFunction = Function;
/** @hidden */
export declare type AnyObservable = Observable<any>;
/** @hidden */
export declare type AnyObservableOrSource = AnyObservable | AnySource;
/**
 The `when` method provides a generalization of the [`zip`](classes/observable.html#zip) function. While zip
 synchronizes events from multiple streams pairwse, the join patterns used in `when` allow
 the implementation of more advanced synchronization patterns.

 Consider implementing a game with discrete time ticks. We want to
 handle key-events synchronized on tick-events, with at most one key
 event handled per tick. If there are no key events, we want to just
 process a tick.

 ```js
 Bacon.when(
 [tick, keyEvent, function(_, k) { handleKeyEvent(k); return handleTick(); }],
 [tick, handleTick])
 ```

 Order is important here. If the [tick] patterns had been written
 first, this would have been tried first, and preferred at each tick.

 Join patterns are indeed a generalization of zip, and for EventStreams, zip is
 equivalent to a single-rule join pattern. The following observables
 have the same output, assuming that all sources are EventStreams.

 ```js
 Bacon.zipWith(a,b,c, combine)
 Bacon.when([a,b,c], combine)
 ```

 Note that [`Bacon.when`](#bacon-when) does not trigger updates for events from Properties though;
 if you use a Property in your pattern, its value will be just sampled when all the
 other sources (EventStreams) have a value. This is useful when you need a value of a Property
 in your calculations. If you want your pattern to fire for a Property too, you can
 convert it into an EventStream using [`property.changes()`](#property-changes) or [`property.toEventStream()`](#property-toeventstream)

 * @param {Pattern<O>} patterns Join patterns
 * @typeparam O result type
 */
export declare function when<O>(...patterns: Pattern<O>[]): EventStream<O>;
/** @hidden */
export declare function whenP<O>(...patterns: Pattern<O>[]): Property<O>;
export default when;
/** @hidden */
export declare function when_<O>(ctor: ObservableConstructor, patterns: Pattern<O>[]): Observable<O>;
/** @hidden */
export declare function extractRawPatterns<O>(patterns: Pattern<O>[]): RawPattern[];
