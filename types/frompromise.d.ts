import { EventTransformer } from "./frombinder";
import { EventStream } from "./observable";
/**
 * Creates an EventStream from a Promise object such as JQuery Ajax.
 This stream will contain a single value or an error, followed immediately by stream end.
 You can use the optional abort flag (i.e. ´fromPromise(p, true)´ to have the `abort` method of the given promise be called when all subscribers have been removed from the created stream.
 You can also pass an optional function that transforms the promise value into Events. The default is to transform the value into `[new Bacon.Next(value), new Bacon.End()]`.
 Check out this [example](https://github.com/raimohanska/baconjs-examples/blob/master/resources/public/index.html).

 *
 * @param {Promise<V>} source promise object
 * @param abort should we call the `abort` method of the Promise on unsubscribe. This is a nonstandard feature you should probably ignore.
 * @param {EventTransformer<V>} eventTransformer
 * @returns {EventStream<V>}
 */
export default function fromPromise<V>(promise: Promise<V>, abort?: boolean, eventTransformer?: EventTransformer<V>): EventStream<V>;
