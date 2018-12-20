import { EventStream } from "./observable";
/**
 Creates an EventStream from a function that
 accepts a callback. The function is supposed to call its callback just
 once. For example:

 ```js
 Bacon.fromCallback(callback => callback("bacon"))
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
export declare function fromCallback<V>(f: Function, ...args: any[]): EventStream<V>;
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
export declare function fromNodeCallback<V>(f: Function, ...args: any[]): EventStream<V>;
