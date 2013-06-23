## 0.4.10

- Fix #195: Bacon.mergeAll for empty list should return Bacon.never()

## 0.4.9

- (#192) Throw runtime error if trying to merge Properties

## 0.4.8

- Add EventStream.skipUntil (#194)

## 0.4.7

- Fix #191: End properly even if an exception is thrown (sequentially, take)

## 0.4.6

- Support n-ary syntax in Bacon.mergeAll and Bacon.zipWith

## 0.4.5

- Add bower.json (component.json deprecated by bower)

## 0.4.3

- Generalize `decode` to all Observables (#189)

## 0.4.2

- Add bufferWithTimeOrCount (#181)

## 0.4.1

- Add flatMapFirst and debounceImmediate (#132)
- Add reduce/fold (#158)

## 0.4.0

- Fix #85 Make Property updates atomic (with known limitations)

## 0.3.15

- Add support for "min" parameter in slidingWindow.

## 0.3.14

- Fix #163: add support for nulls etc in combineTemplate

## 0.3.13

- Fix #162: Call Promise.abort() only if the "abort" flag is used

## 0.3.12

- Support Bacon.Error in Bacon.once, Bacon.fromArray

## 0.3.11

- Fix #160: Property.scan/debounce/throttle/delay bug with sources like
  Bacon.once() and Bacon.constant()

## 0.3.10

- Add AMD support (#154)

## 0.3.9

- Fix #152: Observable.skip now accepts zero and negative values

## 0.3.8

- Fix #153: Remove dep on "global" to fix in browsers.

## 0.3.7

- Fix #151: take(N) should work with N = 0

## 0.3.6

- generalize combine method to all Observables
- Fix #147: Prevent sending duplicate Errors in case the same Error is routed thru multiple paths.
- Internal change: PropertyDispatcher now used in Property constructor
  as a default.

## 0.3.5

- Support constant values to be returned from function f in flatMap
- Fix #148: Handle same subscriber added twice just like two separate subscribers

## 0.3.4

- Add Bacon.onValues shorthand function

## 0.3.3

- Fix #146: Avoid catch-rethrow to preserve original stack trace

## 0.3.2

- #133: Support EventStreams and Properties as arguments of fromCallback,
  fromNodeCallback

## 0.3.1

- Fix #142: map(".foo.bar") failed if "foo" was null

## 0.3.0

- #124: Change combineWith behavior to combine n Observables using n-ary function
- Remove combineAll which had a confusing name and no known uses
- Support constants instead of Observables as arguments of
  combineAsArray, combineWith

## 0.2.8

- Add EventStream.zip, Bacon.zipWith, Bacon.zipAsArray

## 0.2.7

- Removed exception-catching in fromBinder

## 0.2.6

- Fix #129: error handling bug in fromBinder

## 0.2.5

- log() does not crash if console or console.log is undefined

## 0.2.4

- Support Node.js style callbacks using Bacon.fromNodeCallback

## 0.2.3

- Fix #120: take(n) may be triggered more than n times if event emitter is triggered in onValue callback
- Generally more reliable implementation in case of recursively
  generated events

## 0.2.2

- Fix #118: Bus drops all inputs after last consumer of its events is dropped; impossible to re-subscribe

## 0.2.1

- fromPromise calls .abort() on unsubscribe

## 0.2.0

- Rename throttle to debounce
- Rename throttle2 to throttle

## 0.1.10

- Support usage of an EventStream/Property instead of a function as a parameter to flatMap/Latest
- Support optional arguments to Observable.log

## 0.1.9

- Performance improvements
- #106: Fix stream ending in case an exception is thrown
- #105: Rewrite binder stream factory to compose all others

## 0.1.8

- add Property.filter(property)
- reject arguments in Property.toProperty
- add Property.sampledBy(property)
- generalize mapEnd to all Observables
- fix bufferWithTime behaviour: output at steady rate as long as there's anything to output
- add throttle2

## 0.1.7

- Fixed tests too on IE6+

## 0.1.6

- Fix property extraction (".field") syntax compatibility with IE6-7

## 0.1.5

- Bus.plug returns function for unplugging
- Fixes possible memory leak in Bus, related to ended streams

## 0.1.4

- Add `EventStream.awaiting` (ported from Bacon.UI)
- [#80: Fix handling of `undefined` in `skipDuplicates`](https://github.com/raimohanska/bacon.js/pull/80)
- Documented Bacon.fromCallback

## 0.1.2

- Fix bug in case stream values are functions

## 0.1.0

- API change: event.value is now a function. Allows internal
  optimization.
- API changes: drop methods switch (use flatMapLatest), do (use doAction), distinctUntilChanged (use skipDuplicates), decorateWith, latestValue

## 0.0.12

- No external changes. Built with grunt.

## 0.0.11

- Fix IE8 compatibility issue (Array.prototype.indexOf)

## 0.0.10

- Fix flatMap/flatMapLatest in case the function returns a Property
- Allow .fromEventTarget to define a custom mapping function
- Add Observable.diff

## 0.0.9

- Apply correct context in method calls using the dot-methodname form

## 0.0.8

- Support arrays in combineTemplate
- Add Observable.slidingWindow
- Add Property.scan
- Add optional isEqual argument to skipDuplicates

## 0.0.7

- Make log() chainable by returning this instead of undefined
- Add Property.throttle, Property.delay

## 0.0.6

- rename switch->flatMapLatest, do->doAction
