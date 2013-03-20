## 0.2.3

- Fix #120: take(n) may be triggered more than n times if event emitter is triggered in onValue callback

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
- Fix stream ending in case an exception is thrown (#106)
- Rewrite binder stream factory to compose all others (#105)

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
