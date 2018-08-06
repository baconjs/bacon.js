import "./map";
import Observable from "./observable";
import { Property } from "./observable";
/**
 Combines Properties, EventStreams and constant values so that the result Property will have an array of the latest
 values from all sources as its value. The inputs may contain both Properties and EventStreams.


 ```js
 property = Bacon.constant(1)
 stream = Bacon.once(2)
 constant = 3
 Bacon.combineAsArray(property, stream, constant)
 # produces the value [1,2,3]
 ```

 * @param streams streams and properties to combine
 */
export declare function combineAsArray<V>(...streams: (Observable<V> | Observable<V>[])[]): Property<V[]>;
/**
  Combines given *n* Properties,
  EventStreams and constant values using the given n-ary function `f(v1, v2 ...)`.

  To calculate the current sum of three numeric Properties, you can do

```js
function sum3(x,y,z) { return x + y + z }
Bacon.combineWith(sum3, p1, p2, p3)
```
*/
export declare function combineWith(f: Function, ...streams: Observable<any>[]): Property<any>;
/** @hidden */
export declare function combine<V, V2, R>(left: Observable<V>, right: Observable<V2>, f: (V: any, V2: any) => R): Property<R>;
