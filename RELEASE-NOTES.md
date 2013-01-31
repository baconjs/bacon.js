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
