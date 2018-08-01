import { Desc } from "./describe";
import { endEvent, Error } from "./event";
import { makeFunction } from "./internal/functionconstruction";
import fromBinder from "./frombinder";
import { nop } from "./helpers";
import { EventStream } from "./observable";


// TODO: types/doc for the object, fnname variant
/**
 Creates an EventStream from a function that
 accepts a callback. The function is supposed to call its callback just
 once. For example:

 ```js
 Bacon.fromCallback(function(callback) {
  setTimeout(function() {
    callback("Bacon!")
  }, 1000)
})
 ```

 This would create a stream that outputs a single value "Bacon!" and ends
 after that. The use of setTimeout causes the value to be delayed by 1
 second.

 You can also give any number of arguments to [`fromCallback`](#bacon-fromcallback), which will be
 passed to the function. These arguments can be simple variables, Bacon
 EventStreams or Properties. For example the following will output "Bacon rules":

 ```js
 bacon = Bacon.constant('bacon')
 Bacon.fromCallback(function(a, b, callback) {
  callback(a + ' ' + b);
}, bacon, 'rules').log();
 ```

 * @param f
 * @param args
 * @returns {EventStream<V>}
 */
export function fromCallback<V>(f, ...args): EventStream<V> {
  return fromBinder<V>(
    function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    },
    function(value) {
      return [value, endEvent()];
    }
  ).withDesc(new Desc("Bacon", "fromCallback", [f, ...args]))
}

/**
Behaves the same way as `Bacon.fromCallback`,
except that it expects the callback to be called in the Node.js convention:
`callback(error, data)`, where error is null if everything is fine. For example:

```js
var Bacon = require('baconjs').Bacon,
fs = require('fs');
var read = Bacon.fromNodeCallback(fs.readFile, 'input.txt');
read.onError(function(error) { console.log("Reading failed: " + error); });
read.onValue(function(value) { console.log("Read contents: " + value); });
```

 */
export function fromNodeCallback<V>(f, ...args): EventStream<V> {
  return fromBinder<V>(
    function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    },
    function(error, value) {
      if (error) {
        return [new Error(error), endEvent()]
      }
      return [value, endEvent()];
    }
  ).withDesc(new Desc("Bacon", "fromNodeCallback", [f, ...args]))
}