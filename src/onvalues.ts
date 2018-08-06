import { combineAsArray } from "./combine"

/**
 A shorthand for combining multiple
 sources (streams, properties, constants) as array and assigning the
 side-effect function f for the values. The following example would log
 the number 3.

 ```js
 function f(a, b) { console.log(a + b) }
 Bacon.onValues(Bacon.constant(1), Bacon.constant(2), f)
 ```
 */
export default function onValues(...args) {
  return combineAsArray(
    args.slice(0, args.length - 1)
  ).onValues(args[arguments.length - 1])
}