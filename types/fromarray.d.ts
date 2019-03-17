import { EventStream } from "./observable";
import { Event } from "./event";
/**
 Creates an EventStream that delivers the given
 series of values (given as array) to the first subscriber. The stream ends after these
 values have been delivered. You can also send [`Bacon.Error`](classes/error.html) events, or
 any combination of pure values and error events like this:
 `Bacon.fromArray([1, new Bacon.Error()])

 @param   values    Array of values or events to repeat
 @typeparam V Type of stream elements
 */
export default function fromArray<T>(values: (T | Event<T>)[]): EventStream<T>;
