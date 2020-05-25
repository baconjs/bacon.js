Bacon.js
========

<img src="https://raw.github.com/baconjs/bacon.js/master/logo.png" align="right" width="300px" />

A functional reactive programming lib for TypeScript JavaScript, written in TypeScript.

Turns your event spaghetti into clean and declarative feng shui bacon, by switching
from imperative to functional. It's like replacing nested for-loops with functional programming
concepts like [`map`](http://baconjs.github.io/api3/classes/observable.html#map) and [`filter`](http://baconjs.github.io/api3/classes/observable.html#filter). Stop working on individual events and work with event streams instead.
Combine your data with [`merge`](http://baconjs.github.io/api3/classes/eventstream.html#merge) and [`combine`](http://baconjs.github.io/api3/classes/observable.html#combine).
Then switch to the heavier weapons and wield [`flatMap`](http://baconjs.github.io/api3/classes/observable.html#flatmap) and [`combineTemplate`](http://baconjs.github.io/api3/globals.html#combinetemplate) like a boss.

Here's the stuff.

- [API docs](http://baconjs.github.io/api3/index.html)
- [Homepage](http://baconjs.github.io/)
- [Source files](https://github.com/baconjs/bacon.js/tree/master/src)
- [Generated javascript](https://github.com/baconjs/bacon.js/blob/master/dist/)
- [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/)
- [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)
- [Wiki](https://github.com/baconjs/bacon.js/wiki/) with more docs, related projects and more
- [Gitter](https://gitter.im/baconjs/bacon.js) chat for developers of Bacon.
- [Migrating to 2.0](https://github.com/baconjs/bacon.js/wiki/Migration-from-version-1.0-to-2.0)

[![Build Status](https://travis-ci.org/baconjs/bacon.js.svg?branch=master)](https://travis-ci.org/baconjs/bacon.js)
[![BrowserStack Status](https://automate.browserstack.com/badge.svg?badge_key=Mlh0UHp2b1pJS01Uam5ZNHdIZnNHTjJoWGFpNldqR2JUSHdiV2NWb2dyST0tLUowV2Nrd0VmZXJhZWsyNVlyZUJxeHc9PQ==--040027ccf71cd208e0d2597276f5ef1e79eedd43%)](https://automate.browserstack.com/badge.svg?badge_key=Mlh0UHp2b1pJS01Uam5ZNHdIZnNHTjJoWGFpNldqR2JUSHdiV2NWb2dyST0tLUowV2Nrd0VmZXJhZWsyNVlyZUJxeHc9PQ==--040027ccf71cd208e0d2597276f5ef1e79eedd43%)
[![NPM version](http://img.shields.io/npm/v/baconjs.svg)](https://www.npmjs.org/package/baconjs)
[![Dependency Status](https://david-dm.org/baconjs/bacon.js.svg)](https://david-dm.org/baconjs/bacon.js)
[![devDependency Status](https://david-dm.org/baconjs/bacon.js/dev-status.svg)](https://david-dm.org/baconjs/bacon.js#info=devDependencies)

## Install and Usage

### Typescript

Bacon.js starting from version 3.0 is a Typescript library so you won't need any external types. Just
Install using `npm`.

    npm install baconjs

Then you can

```typescript
import { EventStream, once } from "baconjs"

let s: EventStream<string> = once("hello")
s.log()
```

As you can see, the global methods, such as [`once`](http://baconjs.github.io/api3/globals.html#once) are imported separately.

Check out the new [API Documentation](http://baconjs.github.io/api3/index.html), that's now generated using Typedoc from the Typescript source code.

### Modern ES6 Browser, Node.js v.12+

You can directly import Bacon.js as single aggregated ES6 module.

```javascript
import * as Bacon from 'node_modules/baconjs/dist/Bacon.mjs';
Bacon.once("hello").log();
```

### NPM, CommonJS, Node.js

If you're on to CommonJS ([node.js](http://nodejs.org/), [webpack](https://webpack.js.org/) or similar) you can install Bacon using npm.

    npm install baconjs
    
Try it like this:    

```js
node
Bacon=require("baconjs")
Bacon.once("hello").log()
```
    
The global methods, such as [`once`](http://baconjs.github.io/api3/globals.html#once) are available in the `Bacon` object.

### Bower

For [bower](https://github.com/twitter/bower) users:

    bower install bacon

### CDN / Script Tags

Both minified and unminified versions available on [cdnjs](https://cdnjs.com/libraries/bacon.js).

So you can also include Bacon.js using

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/bacon.js/2.0.9/Bacon.js"></script>
<script>
Bacon.once("hello").log()
</script>
```

### AMD / require.js

Bacon.js is an UMD module so it should work with AMD/require.js too. Not tested lately though.


### Github

Prefer to drink from the firehose? Download from Github [master](https://raw.github.com/baconjs/bacon.js/master/dist/Bacon.js).

Intro
=====

The idea of Functional Reactive Programming is quite well described by Conal Elliot at [Stack Overflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming/1030631#1030631).

Bacon.js is a library for functional reactive programming. Or let's say it's a library for
working with [events](http://baconjs.github.io/api3/globals.html#event) in [EventStreams](http://baconjs.github.io/api3/classes/eventstream.html) and dynamic values (which are called [Properties](http://baconjs.github.io/api3/classes/property.html) in Bacon.js).

You can wrap an event source, say "mouse clicks on a DOM element" into an [EventStream](http://baconjs.github.io/api3/classes/eventstream.html) by saying

```js
let $ = (selector) => document.querySelector(selector) 
var clickE = Bacon.fromEvent($("h1"), "click")
```

The `$` helper function above could be replaced with, for instance, jQuery or Zepto.

Each EventStream represents a stream of events. It is an [Observable](http://baconjs.github.io/api3/classes/observable.html), meaning
that you can listen to events in the stream using, for instance, the [`onValue`](http://baconjs.github.io/api3/classes/observable.html#onvalue) method
with a callback. Like this:

```js
clickE.onValue(() => alert("you clicked the h1 element") )
```

But you can do neater stuff too. The Bacon of Bacon.js is that you can transform,
filter and combine these streams in a multitude of ways (see [EventStream API](http://baconjs.github.io/api3/classes/eventstream.html)). The methods [`map`](http://baconjs.github.io/api3/classes/eventstream.html#map),
[`filter`](http://baconjs.github.io/api3/classes/eventstream.html#filter), for example, are similar to same functions in functional list programming
(like [Underscore](http://underscorejs.org/)). So, if you say

```js
let plusE = Bacon.fromEvent($("#plus"), "click").map(1)
let minusE = Bacon.fromEvent($("#minus"), "click").map(-1)
let bothE = plusE.merge(minusE)
```

.. you'll have a stream that will output the number 1 when the "plus" button is clicked
and another stream outputting -1 when the "minus" button is clicked. The `bothE` stream will
be a merged stream containing events from both the plus and minus streams. This allows
you to subscribe to both streams with one handler:

```js
bothE.onValue(val => { /* val will be 1 or -1 */ console.log(val) })
```

Note that you can also use the [`log`](http://baconjs.github.io/api3/classes/observable.html#log) method to log stream values to `console`:

```js
bothE.log()
```


In addition to EventStreams, bacon.js has a thing called [`Property`](http://baconjs.github.io/api3/classes/property.html), that is almost like an
EventStream, but has a "current value". So things that change and have a current state are
Properties, while things that consist of discrete events are EventStreams. You could think
mouse clicks as an EventStream and mouse cursor position as a Property. You can create Properties from
an EventStream with [`scan`](http://baconjs.github.io/api3/classes/observable.html#scan) or [`toProperty`](http://baconjs.github.io/api3/classes/eventstream.html#toproperty) methods. So, let's say

```js
let add = (x, y) => x + y
let counterP = bothE.scan(0, add)
counterP.onValue(sum => $("#sum").textContent = sum )
```

The `counterP` property will contain the sum of the values in the `bothE` stream, so it's practically
a counter that can be increased and decreased using the plus and minus buttons. The [`scan`](http://baconjs.github.io/api3/classes/observable.html#scan) method
was used here to calculate the "current sum" of events in the `bothE` stream, by giving a "seed value"
`0` and an "accumulator function" `add`. The scan method creates a property that starts with the given
seed value and on each event in the source stream applies the accumulator function to the current
property value and the new value from the stream.


Hiding and showing the result div depending on the content of the property value is equally straightforward

```js
let hiddenIfZero = value => value == 0 ? "hidden" : "visible"
counterP.map(hiddenIfZero)
  .onValue(visibility => { $("#sum").style.visibility = visibility })
```

For an actual (though a bit outdated) tutorial, please check out my [blog posts](http://nullzzz.blogspot.fi/2012/11/baconjs-tutorial-part-i-hacking-with.html)

API
===

Creating EventStreams and Properties
----------------

There's a multitude of methods for creating an EventStream from different sources, including the DOM, node callbacks and promises for example. 
See [EventStream](http://baconjs.github.io/api3/classes/eventstream.html) documentation.

Properties are usually created based on EventStreams. Some common ways are intruduced in [Property](http://baconjs.github.io/api3/classes/property.html) documentation.

Combining multiple streams and properties
-----------------------------------------

You can combine the latest value from multple sources using [combine](http://baconjs.github.io/api3/classes/observable.html#combine), [combineAsArray](http://baconjs.github.io/api3/globals.html#combineasarray), 
[combineWith](http://baconjs.github.io/api3/globals.html#combinewith) or [combineTemplate](http://baconjs.github.io/api3/globals.html#combinetemplate).

You can merge multiple streams into one using [merge](http://baconjs.github.io/api3/classes/eventstream.html#merge) or [mergeAll](http://baconjs.github.io/api3/globals.html#mergeall).

You can concat streams using [concat](http://baconjs.github.io/api3/classes/observable.html#concat) or [concatAll](http://baconjs.github.io/api3/globals.html#concatall).

If you want to get the value of an observable but emit only when another stream emits an event, you might want to use [sampledBy](http://baconjs.github.io/api3/classes/observable.html#sampledby)
or its cousin [withLatestFrom](http://baconjs.github.io/api3/classes/observable.html#withlatestfrom).

Latest value of Property or EventStream
---------------------------------------

One of the common first questions people ask is "how do I get the
latest value of a stream or a property". There is no getLatestValue
method available and will not be either. You get the value by
subscribing to the stream/property and handling the values in your
callback. If you need the value of more than one source, use one of the
combine methods.

Bus
---

[`Bus`](http://baconjs.github.io/api3/classes/bus.html) is an [`EventStream`](http://baconjs.github.io/api3/classes/eventstream.html) that allows you to [`push`](http://baconjs.github.io/api3/classes/bus.html#push) values into the stream.
It also allows plugging other streams into the Bus. 

Event
-----

There are essentially three kinds of [Events](http://baconjs.github.io/api3/classes/event.html) that are emitted by EventStreams and Properties:

- [Value](http://baconjs.github.io/api3/classes/value.html) events that convey a value. If you subscribe using [onValue](http://baconjs.github.io/api3/classes/observable.html#onvalue), 
  you'll only deal with values. Also [`map`](http://baconjs.github.io/api3/classes/observable.html#map), [`filter`](http://baconjs.github.io/api3/classes/observable.html#filter) and most of the other operators
  also deal with values only.
- [Error](http://baconjs.github.io/api3/classes/error.html) events indicate that an error has occurred. More on errors below!
- [End](http://baconjs.github.io/api3/classes/end.html) event is emitted at most once, and is always the last event emitted by an Observable.

If you want to subscribe to all events from an Observable, you can use the [subscribe](http://baconjs.github.io/api3/classes/observable.html#subscribe) method.


Errors
------

[`Error`](http://baconjs.github.io/api3/classes/error.html) events are always passed through all stream operators. So, even
if you filter all values out, the error events will pass through. If you
use flatMap, the result stream will contain Error events from the source
as well as all the spawned stream.

You can take action on errors by using [`onError`](http://baconjs.github.io/api3/classes/observable.html#onerror).

See also [`mapError`](http://baconjs.github.io/api3/classes/observable.html#maperror), [`errors`](http://baconjs.github.io/api3/classes/observable.html#errors), [`skipErrors`](http://baconjs.github.io/api3/classes/observable.html#skiperrors), 
[`Bacon.retry`](http://baconjs.github.io/api3/globals.html#retry) and [`flatMapError`](http://baconjs.github.io/api3/classes/observable.html#flatmaperror).

In case you want to convert (some) value events into [`Error`](http://baconjs.github.io/api3/classes/error.html) events, you may use [`flatMap`](http://baconjs.github.io/api3/classes/observable.html#flatmap) like this:

```js
stream = Bacon.fromArray([1,2,3,4]).flatMap(function(x) {
  if (x > 2)
    return new Bacon.Error("too big")
  else
    return x
})
```

Conversely, if you want to convert some [`Error`](http://baconjs.github.io/api3/classes/error.html) events into value events, you may use [`flatMapError`](http://baconjs.github.io/api3/classes/observable.html#flatmaperror):

```js
myStream.flatMapError(function(error) {
  return isNonCriticalError(error) ? handleNonCriticalError(error) : new Bacon.Error(error)
})
```

Note also that Bacon.js operators do not catch errors that are thrown.
Especially [`map`](http://baconjs.github.io/api3/classes/observable.html#map) doesn't do so. If you want to map things
and wrap caught errors into Error events, you can do the following:

```js
wrapped = source.flatMap(Bacon.try(dangerousOperation))
```

For example, you can use [`Bacon.try`](http://baconjs.github.io/api3/globals.html#try) to handle JSON parse errors:

```js
var jsonStream = Bacon
  .once('{"this is invalid json"')
  .flatMap(Bacon.try(JSON.parse))

jsonStream.onError(function(err) {
  console.error("Failed to parse JSON", err)
})
```

An Error does not terminate the stream. The method [`endOnError`](http://baconjs.github.io/api3/classes/observable.html#endonerror)
returns a stream/property that ends immediately after the first error.

Bacon.js doesn't currently generate any [`Error`](http://baconjs.github.io/api3/classes/error.html) events itself (except when
converting errors using [`fromPromise`](http://baconjs.github.io/api3/globals.html#frompromise)). Error
events definitely would be generated by streams derived from IO sources
such as AJAX calls.

See [retry](http://baconjs.github.io/api3/globals.html#retry) for retrying on error.


Introspection and metadata
--------------------------

Bacon.js provides ways to get some descriptive metadata about all Observables.

See [`toString`](http://baconjs.github.io/api3/classes/observable.html#tostring), [`deps`](http://baconjs.github.io/api3/classes/observable.html#deps), [`desc`](http://baconjs.github.io/api3/classes/observable.html#desc),
[`spy`](http://baconjs.github.io/api3/globals.html#spy).

## Changes to earlier versions

### Function Construction rules removed in 3.0

Function construction rules, which allowed you to use string shorthands for properties and methods,
were removed in version 3.0, as they are not as useful as they used to be, due to the moderd, short
lambda syntax in ES6 and Typescript, as well as libraries like Ramda and partial.lenses.

### Lazy evaluation removed in 2.0

Lazy evaluation of event values has been removed in version 2.0

Cleaning up
-----------

As described above, a subscriber can signal the loss of interest in new events
in any of these two ways:

1. Return [`noMore`](http://baconjs.github.io/api3/globals.html#nomore) from the handler function
2. Call the `dispose()` function that was returned by the [`subscribe`](http://baconjs.github.io/api3/classes/observable.html#subscribe) or [`onValue`](http://baconjs.github.io/api3/classes/observable.html#onvalue)
   call.

Based on my experience, an actual side-effect subscriber
in application-code almost never does this. Instead you'll use methods like [takeUntil](http://baconjs.github.io/api3/classes/observable.html#takeuntil)
to stop listening to a source when something happens. 


EventStream and Property semantics
----------------------------------

The state of an EventStream can be defined as (t, os) where `t` is time
and `os` the list of current subscribers. This state should define the
behavior of the stream in the sense that

1. When a Next event is emitted, the same event is emitted to all subscribers
2. After an event has been emitted, it will never be emitted again, even
if a new subscriber is registered. A new event with the same value may
of course be emitted later.
3. When a new subscriber is registered, it will get exactly the same
events as the other subscriber, after registration. This means that the
stream cannot emit any "initial" events to the new subscriber, unless it
emits them to all of its subscribers.
4. A stream must never emit any other events after End (not even another End)

The rules are deliberately redundant, explaining the constraints from
different perspectives. The contract between an EventStream and its
subscriber is as follows:

1. For each new value, the subscriber function is called. The new
   value is wrapped into a [`Next`](http://baconjs.github.io/api3/classes/next.html) event.
2. The subscriber function returns a result which is either [`noMore`](http://baconjs.github.io/api3/globals.html#nomore) or
[`more`](http://baconjs.github.io/api3/globals.html#more). The `undefined` value is handled like [`more`](http://baconjs.github.io/api3/globals.html#more).
3. In case of [`noMore`](http://baconjs.github.io/api3/globals.html#nomore) the source must never call the subscriber again.
4. When the stream ends, the subscriber function will be called with
   and [`End`](http://baconjs.github.io/api3/classes/end.html) event. The return value of the subscribe function is
   ignored in this case.

A [`Property`](http://baconjs.github.io/api3/classes/property.html) behaves similarly to an [`EventStream`](http://baconjs.github.io/api3/classes/eventstream.html) except that

1. On a call to `subscribe`, it will deliver its current value
(if any) to the provided subscriber function wrapped into an [`Initial`](http://baconjs.github.io/api3/classes/initial.html)
event.
2. This means that if the Property has previously emitted the value `x`
to its subscribers and that is the latest value emitted, it will deliver
this value to the new subscriber.
3. Property may or may not have a current value to start with. Depends
on how the Property was created.

Atomic updates
--------------

Bacon.js supports atomic updates to properties for solving a [glitches problem](https://en.wikipedia.org/wiki/Reactive_programming#Glitches).

Assume you have properties A and B and property C = A + B. Assume that
both A and B depend on D, so that when D changes, both A and B will
change too.

When D changes `d1 -> d2`, the value of A `a1 -> a2` and B changes `b1
-> b2` simultaneously, you'd like C to update atomically so that it
would go directly `a1+b1 -> a2+b2`. And, in fact, it does exactly that.
Prior to version 0.4.0, C would have an additional transitional
state like `a1+b1 -> a2+b1 -> a2+b2`

For jQuery users
----------------

Earlier versions of Bacon.js automatically installed the [`asEventStream`](http://baconjs.github.io/api3/globals.html#_)
 method into jQuery.
Now, if you still want to use that method, initialize this integration by calling [`Bacon.$.init($)`](http://baconjs.github.io/api3/globals.html#_)
.

For RxJs Users
--------------

Bacon.js is quite similar to RxJs, so it should be pretty easy to pick up. The
major difference is that in bacon, there are two distinct kinds of Observables:
the EventStream and the Property. The former is for discrete events while the
latter is for observable properties that have the concept of "current value".

Also, there are no "cold observables", which
means also that all EventStreams and Properties are consistent among subscribers:
when an event occurs, all subscribers will observe the same event. If you're
experienced with RxJs, you've probably bumped into some wtf's related to cold
observables and inconsistent output from streams constructed using scan and startWith.
None of that will happen with bacon.js.

Error handling is also a bit different: the Error event does not
terminate a stream. So, a stream may contain multiple errors. To me,
this makes more sense than always terminating the stream on error; this
way the application developer has more direct control over error
handling. You can always use [`endOnError`](http://baconjs.github.io/api3/classes/observable.html#endonerror) to get a stream
that ends on the first error!

Examples
========

See [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)

See [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/)

See Worzone [demo](http://juhajasatu.com/worzone/) and [source](http://github.com/raimohanska/worzone)

Build
=====


First check out the Bacon.js repository and run `npm install`.

Then build the Typescript sources into a javascript bundle (plus typescript type definitions):

    npm run dist

Result javascript files will be generated in `dist` directory. If your planning
to develop Bacon.js yourself, you'll want to run [tests] too using `npm test`.

Test
====

Run all unit tests:

    npm test
    
The tests are run against the javascript bundle in the `dist` directory. You can build the bundle using `npm run dist`.

This will loop thru all files under `spec` and build the library with the
single feature and run the test.

Run browser tests locally:

    npm install
    npm run browsertest-bundle
    npm rum browsertest-open

Run performance tests:

    performance/PerformanceTest.coffee
    performance/PerformanceTest.coffee flatmap

Run memory usage tests:

    coffee --nodejs '--expose-gc' performance/MemoryTest.coffee

Dependencies
============

Runtime: none
Build/test: see [package.json].

Compatibility with other libs
=============================

Bacon.js doesn't mess with prototypes or the global object, except that it exports the Bacon object as `window.Bacon` when installed using the `<script>` tag.

So, it should be pretty much compatible and a nice citizen.

I'm not sure how it works in case some other lib adds stuff to, say, Array prototype, though. Maybe add test for this later?

Compatibility with browsers
===========================

TLDR: good.

Bacon.js is not browser dependent, because it is not a UI library. It should work on all ES5-ish runtimes.

Automatically tested on each commit on modern browsers in Browserstack.


Why Bacon?
==========

Bacon.js exists largely because I got frustrated with RxJs, which is a good library, but at that time
didn't have very good documentation and wasn't open-source. Things have improved a lot in the Rx
world since that. Yet, there are still compelling reasons to use Bacon.js instead. Like, for instance,

- more consistent stream/property behavior 
- simplicity of use
- atomic updates

If you're more into performance and less into atomic updates, you might want to check out [Kefir.js](https://kefirjs.github.io/kefir/)!

Contribute
==========

Use [GitHub issues](https://github.com/baconjs/bacon.js/issues) and [Pull Requests](https://github.com/baconjs/bacon.js/pulls).

Note:
- the `dist/Bacon*.js` files are assembled from files in `src/`. After updating source files, run `npm install` to update the generated files. Then commit and create your Pull Request.
- the [API docs](http://baconjs.github.io/api3/index.html) are generated from this README and docstrings in the sources in the src directory. See the [baconjs.github.io](https://github.com/baconjs/baconjs.github.io) repository for more info.

Sponsors
========

Thanks to [BrowserStack](http://www.browserstack.com) for kindly providing me with free of charge automatic testing time.

Thanks also to [Reaktor](https://reaktor.com/) for supporting Bacon.js development and letting me use some of my working hours on open-source development.

<a href="https://reaktor.com/"><img src="https://baconjs.github.io/supported-by-reaktor.png" /></a>
