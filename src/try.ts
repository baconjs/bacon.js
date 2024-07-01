import once from "./once";
import { Error } from "./event";
import { EventStream } from "./observable";

/** 
 `Bacon.try` is a helper for creating an EventStream of a single value, or a single Error event in case the given
 function throws an exception.

For example, you can use `Bacon.try` to handle JSON parse errors:

```js
var jsonStream = Bacon
  .once('{"this is invalid json"')
  .flatMap(Bacon.try(JSON.parse))

jsonStream.onError(function(err) {
  console.error("Failed to parse JSON", err)
})

 */
export default function tryF<In, Out>(f: (value: In) => Out): (value: In) => EventStream<Out> {
  return function(value) {
    try {
      return once(f(value));
    } catch(e) {
      return once(new Error(e));
    }
  };
}
