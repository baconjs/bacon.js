import "./scan";
import Observable, { Property } from "./observable";
/**
 *  [Update](#update) pattern consisting of a single EventStream and a accumulator function.
 */
export declare type UpdatePattern1<I1, O> = [Observable<I1>, (O: any, I1: any) => O];
/**
 *  [Update](#update) pattern consisting of a 2 Observables and an accumulrator function. At least one of the Observables must be an EventStream.
 */
export declare type UpdatePattern2<I1, I2, O> = [Observable<I1>, Observable<I1>, (O: any, I1: any, I2: any) => O];
/**
 *  [Update](#update) pattern consisting of a 3 Observables and an accumulrator function. At least one of the Observables must be an EventStream.
 */
export declare type UpdatePattern3<I1, I2, I3, O> = [Observable<I1>, Observable<I1>, Observable<I3>, (O: any, I1: any, I2: any, I3: any) => O];
/**
 *  [Update](#update) pattern consisting of a 4 Observables and an accumulrator function. At least one of the Observables must be an EventStream.
 */
export declare type UpdatePattern4<I1, I2, I3, I4, O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, (O: any, I1: any, I2: any, I3: any, I4: any) => O];
/**
 *  [Update](#update) pattern consisting of a 5 Observables and an accumulrator function. At least one of the Observables must be an EventStream.
 */
export declare type UpdatePattern5<I1, I2, I3, I4, I5, O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, Observable<I5>, (O: any, I1: any, I2: any, I3: any, I4: any, I5: any) => O];
/**
 *  [Update](#update) pattern consisting of a 6 Observables and an accumulrator function. At least one of the Observables must be an EventStream.
 */
export declare type UpdatePattern6<I1, I2, I3, I4, I5, I6, O> = [Observable<I1>, Observable<I1>, Observable<I3>, Observable<I4>, Observable<I5>, Observable<I6>, (O: any, I1: any, I2: any, I3: any, I4: any, I5: any, I6: any) => O];
/**
 *  [Update](#update) pattern type, allowing up to 6 sources per pattern.
 */
export declare type UpdatePattern<O> = UpdatePattern1<any, O> | UpdatePattern2<any, any, O> | UpdatePattern3<any, any, any, O> | UpdatePattern4<any, any, any, any, O> | UpdatePattern5<any, any, any, any, any, O> | UpdatePattern6<any, any, any, any, any, any, O>;
/**
 Creates a Property from an initial value and updates the value based on multiple inputs.
 The inputs are defined similarly to [`Bacon.when`](#bacon-when), like this:

 ```js
 var result = Bacon.update(
 initial,
 [x,y,z, (previous,x,y,z) => { ... }],
 [x,y,   (previous,x,y) => { ... }])
 ```

 As input, each function above will get the previous value of the `result` Property, along with values from the listed Observables.
 The value returned by the function will be used as the next value of `result`.

 Just like in [`Bacon.when`](#when), only EventStreams will trigger an update, while Properties will be just sampled.
 So, if you list a single EventStream and several Properties, the value will be updated only when an event occurs in the EventStream.

 Here's a simple gaming example:

 ```js
 let scoreMultiplier = Bacon.constant(1)
 let hitUfo = Bacon.interval(1000)
 let hitMotherShip = Bacon.later(10000)
 let score = Bacon.update(
 0,
 [hitUfo, scoreMultiplier, (score, _, multiplier) => score + 100 * multiplier ],
 [hitMotherShip, (score, _) => score + 2000 ]
 )
 ```

 In the example, the `score` property is updated when either `hitUfo` or `hitMotherShip` occur. The `scoreMultiplier` Property is sampled to take multiplier into account when `hitUfo` occurs.

 * @param initial
 * @param {UpdatePattern<Out>} patterns
 * @returns {Property<Out>}
 */
export declare function update<Out>(initial: any, ...patterns: UpdatePattern<Out>[]): Property<Out>;
