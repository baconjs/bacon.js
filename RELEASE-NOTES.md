## 3.0.5

- Add alternative signature to groupBy: no type param, no optional limitF param

## 3.0.4

- Improve Bus.plug type ergonomics (#738)
- Allow `any` in `Reply` return type used in `subscribe`, `onValue` et al (#740)
- More flexible typing for `merge` and `concat` (merge observables of `A` and `B` into `A | B`)
- Compile library and tests with `--strict`

## 3.0.1

- Fix Bacon.mergeAll incorrectly passing through Initial events (#736)

## 3.0.0

- Fully converted to TypeScript. No need for separate types when using from TypeScript
- Still works from Javascript, except for some changes listed below
- Function Construction Rules are gone. No more `stream.map(".fieldName")`
- observable.last() only stores value events, passes through errors (I think this was a bug)
- added Bacon.silence(duration)
- Replaced `withHandler` with `transform`
- sampledBy typed version doesn't support the optional combinator parameter (works from js though)
- Observable argument support removed from `fromCallback` and `fromNodeCallback`

## 2.0.11

- Flatscan only defined for EventStreams (as per docs, fix #733)

## 2.0.10

- Fix Bacon.fromArray bug (#724)

## 2.0.9

- Fix Property.flatMapLatest (#719)

## 2.0.5

- Fix force-async behavior in EventStream constructor (#713)

## 2.0.4

- Correct version information included in descriptor files and published dist/*.js files

## 2.0.1

- Support custom binder function in `Bacon.fromEvent` (#710)

## 2.0.0

- Remove lazy evaluation of event values (#700)
- Make Bacon.once and friends asynchronous (#706)
- Use rollup to build everything from ES6 modules (#708)
- Force asyncness of all streams created with any of the stream constructors (#711)

## 1.0.1

- Fixed unexpected behavior with synchronous sources and flatMapLatest (#699)

## 1.0.0

- No changes. Same as 0.7.95

## 0.7.95

- Add `Property::concat`
- Add `Bacon.concatAll`
- Improve `Bacon.combineTemplate`: support all kinds of objects on root level, always use original objects when they don't contain Observables.

## 0.7.94

- Fix #693: failure when there's extra junk in Array proto
- Ensure that the same never happens again by adding lots of junk in Array proto when running tests

## 0.7.93

- Improve processing order of side-effects (onValue etc) when Bus is pushed while in onValue
- ensure that subscribers of observable A won't be called again before first call is fully handled
- ensure correct processing order while handling independent observables as soon as possible

## 0.7.92

- Added ECMAScript Observable support (#649)

## 0.7.91

- `Bacon.retry` supplies the `source` function with attempt number

## 0.7.90

- Add `EventSTream::flatScan` method

## 0.7.89

- Add missing `Property::debounceImmediate` method

## 0.7.88

- Restore the removed `Observable::deps` method

## 0.7.87

- `Bacon.retry` retries indefinitely if `retries` is zero.

## 0.7.86

- Fix array mutation issue in `Bacon.combineAsArray` (#673)

## 0.7.85

- Workaround for Node 6 (#671)

## 0.7.84

- Fix holdWhen: properly end the result stream if src has ended while holding. (Pull Request #666 by @umanamente)

## 0.7.83

- Remove dependency to Array.from

## 0.7.82

- Fix bug related to previous performance improvement

## 0.7.81

- Performance improvements for complex event graphs

## 0.7.80

- Fix combineTemplate for objects with a prototype (#615)

## 0.7.79

- Fix IE8 compatibility (#650)

## 0.7.78

- Fix #648: eventTransformer in asEventStream

## 0.7.76

- Add `doEnd` to complement `doAction` and `doError`

## 0.7.75

- Bacon.fromEvent works even if there's no "unbind" method available (#638)

## 0.7.74

- Add `Bacon.try`

## 0.7.72

- fix #621: loading fails with webpack in some configurations

## 0.7.72

- support new-less constructors in EventStream, Bus, Next, Initial, End, Error

## 0.7.71

- make zipWith, combineWith signatures consistent, allow 4 variations in each

## 0.7.70

- Fix `zip`, `Bacon.when` with endless streams (#610)

## 0.7.69

- Fix bug in `bufferWithTime` (possible double flush)

## 0.7.68

- Fix bug in `scan`

## 0.7.67

- Fix bug in `holdWhen` (#613)

## 0.7.66

- Add `groupBy` (#611)

## 0.7.65

- Fix `holdWhen` in a special case

## 0.7.64

- Fix #594: _.each, holdWhen in case there's extra stuff in Array prototype

## 0.7.63

- Restored legacy constructor support in EventStream (removed in 0.7.61)

## 0.7.62

- Support custom eventTranformer in fromPromise

## 0.7 61

- Add `doLog`
- Fix holdWhen with synchrnous sources (#597)
- Performance improvements

## 0.7.60

- Re-impl holdWhen for better performance. Fix "never-ending valve" case on the way.

## 0.7.59

- Add `doError()` (#581)

## 0.7.58

- Fix #582, bower.json format

## 0.7.57

- Fix #517, bus should bounce End event when subscribing after end() call

## 0.7.56

- Ignore extra files in bower

## 0.7.55

- Fix #572: Bus respects end() calls before subscribers

## 0.7.54

- Fix #580: stack overflow with fromArray using large arrays
- Throw an exception with a helpful error message if the user calls `filter(EventStream)`,
  `takeWhile(EventStream)` or `skipWhile(EventStream)`

  This is a potentially **backward incompatible change**.

## 0.7.52

- Fix #560: unscheduling fail in case subscriber throws error

## 0.7.51

- Add `toPromise()`, `first()` and `last()` (#509)

## 0.7.50

- Fix #501: Call promise.done() to prevent swallowing exceptions from wrapped Promises

## 0.7.49

- Introduce Bacon.repeat(fn), previously known as Bacon.fromStreamGenerator

## 0.7.48

- Fix stack overflow with synchronous sources in Bacon.fromStreamGenerator

## 0.7.47

- Fix #541: stack overflow with Bacon.retry

## 0.7.46

- Fix #506: smarter method lookup in Bacon.fromEvent

## 0.7.45

- Fix #543: holdWhen with array values
- Fix #544: bufferWithTimeOrCount

## 0.7.44

Foobar, don't use

## 0.7.43

- Add `Bacon.fromEvent` as shorthand for `Bacon.fromEventTarget`
- Add `Observable :: forEach` as synonym for `onValue`

## 0.7.42

- Fix #523: respect return value of subscribe function in synchronous case
- Built using assemble.js
- removed setTimeout from Bacon.fromBinder

## 0.7.41

- Fix #490: throw if non-observable plugged to bus

## 0.7.40

- Fix #491: takeUntil/flatMapLatest issues with sync sources

## 0.7.39

- Fix wrapping constants as functions in Bacon.when

## 0.7.38

- Fix #488: exceptions catched and hidden

## 0.7.36

- Improve Dispatcher performance (#473)

## 0.7.35

- Improve side-effect processing performance by reducing array mutation

## 0.7.34

- Fix #470: unexpected ordering of side effects
- Make `scan` use eager evaluation

## 0.7.33

- Improve performance (#467)

## 0.7.32

- Support "on/off" events in Bacon.fromEventTarget (#461)

## 0.7.31

- Eliminate extra Dispatcher object (#463)

## 0.7.30

- Fix Source::toString

## 0.7.29

- Performance and memory footprint improvements (#457)
- Restore Observable::subscribeInternal for backward compat (to be removed in 0.8)

## 0.7.28

- Performance and memory footprint improvements (#450)

## 0.7.27

- Merge #413: preserve "this" context in eventTransformer of fromBinder etc

## 0.7.26

- Fix #447: issue with Property::takeUntil error handling

## 0.7.25

- Fix #441: check for module.exports

## 0.7.24

- Changed dispatching of delayed events for improved memory performance

## 0.7.23

- Fix fromArray.toString (#436)

## 0.7.22

- Throw Errors instead of strings in asserts (fix #414)

## 0.7.21 

- Fix #409 (invalid characters)

## 0.7.20

- Fix #399 (double evaluation of lazies with Bus)
- Fix #407 (event duplication in a specific scenario)

## 0.7.19

- Performance and memory footprint improvements

## 0.7.18

- Fix #397 (include minified version in npm)

## 0.7.17

- Fix #394 (never call unbinder twice in fromBinder)

## 0.7.16

- Fix #353 (flatMapLatest glitch)

## 0.7.15

- Fix #363 (glitchfree-algorithm bug)

## 0.7.14

- Fix Bacon.retry (#380)

## 0.7.13

- Add flatMapWithConcurrencyLimit, flatMapConcat, bufferingThrottle, holdWhen (#324)

## 0.7.12

- Add Bacon.retry, flatMapError, Bacon.error by @mileskin (#310)
- Improve mergeAll performance by removing recursion (#373)

## 0.7.11

- Optimizations by @lautis (#370)

## 0.7.9

- Fix #348: toString problems with jQuery
- Make .log() log the actual values instead of strings, again

## 0.7.8

- Fix #347: bug related to evaluating (lazy) event values later

## 0.7.7

- Fix #345: stack overflow with circular setups with Bus

## 0.7.6

- Fix #338: event duplication bug in a specific scenario

## 0.7.5

- Call external subscriber callbacks after event transaction is complete
- Remove Bacon.afterTransaction

## 0.7.4

- Add Bacon.afterTransaction for coordinating timings, in e.g. Bacon.Model

## 0.7.3

- Fix #331: combineTemplate when Date or RegEx objects are involved

## 0.7.2

- Fix #315: _.toString for objects that contain enumerable but innaccessible properties (like the HTML hidden field)
- Fix #320, #321: errors thrown when Array.prototype contains extra junk

## 0.7.1

- Support function construction rules in flatMap(Latest|First) (#306)

## 0.7.0

- Glitch-free updates (#272)
- toString/inspect implementation (#265)
- Published Bacon._ API including helpers like Bacon._.indexOf

## 0.6.22

- Include Bacon.version="0.6.22" in dist/Bacon.js (generated in release
  script)
- Stabilize fromArray in case of subscribe unsubscribing in the middle of the array

## 0.6.21

- Fix bug in concat with synchronous left stream (#262)

## 0.6.20

- Fix Property.zip (#260)

## 0.6.19

- Fix AMD support that was partially broken in 0.6.14

## 0.6.18

- Allow (object, methodName, args...) syntax in from(Node)Callback

## 0.6.17

- Allow predicate function in Observable.endOnError

## 0.6.16

- Add EventStream.sampledBy

## 0.6.15

- Add Property.startWith

## 0.6.14

- Simplifications and cleanup

## 0.6.13

- Fix #240: call accumulator function once per event in `scan`

## 0.6.12

- Fix mergeAll, zipAsArray, zipWith with 0 sources, n-ary syntax

## 0.6.11

- Fix Bacon.zipAsArray with 0 or 1 sources
- Fix Bacon.when with 0 sources and 0-length patterns

## 0.6.9

- Fix Bacon.when with Properties (#232)
- Fix laziness of evaluation. Added tests to prevent further regression.
- Re-implemented `combineAsArray` and `sampledBy` using Bacon.when

## 0.6.8

- Fix skipWhile in case of Error events before first match (refix #218)

## 0.6.7

- Fix #218: EventStream.skipWhile with synchronous sources

## 0.6.6

- Fix #217: EventStream.scan for synchronous streams
- Simplify skipUntil implementation

## 0.6.5

- Fix `takeUntil` to work correctly with never-ending stopper (#214)

## 0.6.4

- Generalize `awaiting` to Properties too

## 0.6.3

- Fix Property.skipDuplicates: don't ever skip an Initial event (#211)

## 0.6.2

- Fix sampledBy with stream of functions (#208)

## 0.6.1

- Fix #206: takeUntil should work with Property as stopper

## 0.6.0

- Add EventStream.skipWhile, support "Property Bool" instead of predicate function in takeWhile (#204)
  skipWhile
- Fix Property.take(n) etc in case of a never-ending Property (#205)
- Fix EventStream.skipUntil in case of self-derived stopper
- Re-implement EventStream.takeUntil
- Switch test framework from Jasmine to Mocha

## 0.5.1

- Fix bug in Bacon.update (#199)

## 0.5.0

- Added Join Patterns, i.e. Bacon.when and Bacon.update (#167)
- Corrected the name to "bacon" instead of "baconjs" in bower.json,
  component.json (#197)

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
