import { EventStream } from "./observable";
import Observable from "./observable";
/**
 Calls generator function which is expected to return an observable. The returned EventStream contains
 values and errors from the spawned observable. When the spawned observable ends, the generator is called
 again to spawn a new observable.

 This is repeated until the generator returns a falsy value
 (such as `undefined` or `false`).

 The generator function is called with one argument — iteration number starting from `0`.

 Here's an example:

```js
Bacon.repeat(function(i) {
if (i < 3) {
  return Bacon.once(i);
} else {
  return false;
}
}).log()
```

 The example will produce values 0, 1 and 2.

 @param {(number) => (Observable<V> | null)} generator
 @returns {EventStream<V>}
 @typeparam V Type of stream elements

 */
export default function repeat<V>(generator: (iteration: number) => (Observable<V> | undefined)): EventStream<V>;
