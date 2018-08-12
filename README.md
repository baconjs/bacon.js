Bacon.js
========

TODO: fix doc links
TODO: include Typescript

<img src="https://raw.github.com/baconjs/bacon.js/master/logo.png" align="right" width="300px" />

A small functional reactive programming lib for JavaScript.

Turns your event spaghetti into clean and declarative feng shui bacon, by switching
from imperative to functional. It's like replacing nested for-loops with functional programming
concepts like [`map`](#observable-map) and [`filter`](#observable-filter). Stop working on individual events and work with event streams instead.
Combine your data with [`merge`](#stream-merge) and [`combine`](#observable-combine).
Then switch to the heavier weapons and wield [`flatMap`](#observable-flatmap) and [`combineTemplate`](#bacon-combinetemplate) like a boss.

It's the `_` of Events. Too bad the symbol `~` is not allowed in JavaScript.

Here's the stuff.

- [Homepage](http://baconjs.github.io/)
- [Source files](https://github.com/baconjs/bacon.js/tree/master/src)
- [Generated javascript](https://github.com/baconjs/bacon.js/blob/master/dist/)
- [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/specs/main.coffee)
- [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)
- [Wiki](https://github.com/baconjs/bacon.js/wiki/) with more docs, related projects and more
- [Cheat Sheet](http://www.cheatography.com/proloser/cheat-sheets/bacon-js/)
- [My Blog](http://nullzzz.blogspot.com) with some baconful and reactive postings along with a Bacon.js tutorial
- [Bacon.js Blog](http://baconjs.blogspot.com)
- [Bacon.js Google Group](https://groups.google.com/forum/#!forum/baconjs) for discussion and questions
- [TodoMVC with Bacon.js and jQuery](https://github.com/raimohanska/todomvc/blob/bacon-jquery/labs/architecture-examples/baconjs/js/app.js)
- [Stack Overflow](http://stackoverflow.com/questions/tagged/bacon.js) for well-formed questions. Use the "bacon.js" tag.
- [Gitter](https://gitter.im/baconjs/bacon.js) chat for developers of Bacon.
- [Migrating to 2.0](https://github.com/baconjs/bacon.js/wiki/Migration-from-version-1.0-to-2.0)

And remember to give me feedback on the bacon! Let me know if you've
used it. Tell me how it worked for you. What's missing? What's wrong?
Please contribute!

[![Build Status](https://travis-ci.org/baconjs/bacon.js.svg?branch=master)](https://travis-ci.org/baconjs/bacon.js)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=RDRnTElXMlRsK2pWdXhYQXVOMkQvdz09LS1mbmgyL0l2NlVBUFZQNWEzYlIvWit3PT0=--779bf4c07cb76abcbee64b15f00e1998f7880ff2%)](https://www.browserstack.com/automate/public-build/RDRnTElXMlRsK2pWdXhYQXVOMkQvdz09LS1mbmgyL0l2NlVBUFZQNWEzYlIvWit3PT0=--779bf4c07cb76abcbee64b15f00e1998f7880ff2%)
[![NPM version](http://img.shields.io/npm/v/baconjs.svg)](https://www.npmjs.org/package/baconjs)
[![Dependency Status](https://david-dm.org/baconjs/bacon.js.svg)](https://david-dm.org/baconjs/bacon.js)
[![devDependency Status](https://david-dm.org/baconjs/bacon.js/dev-status.svg)](https://david-dm.org/baconjs/bacon.js#info=devDependencies)

Install
=======

If you're targeting to [node.js](http://nodejs.org/), you can

    npm install baconjs

For [bower](https://github.com/twitter/bower) users:

    bower install bacon

Both minified and unminified versions available on [cdnjs](https://cdnjs.com/libraries/bacon.js).

Starting from 0.7.45, you can build your own Bacon.js bundle with selected features
only. See instructions [here](#build).

Prefer to drink from the firehose? Download from Github [master](https://raw.github.com/baconjs/bacon.js/master/dist/Bacon.js).


Intro
=====

The idea of Functional Reactive Programming is quite well described by Conal Elliot at [Stack Overflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming/1030631#1030631).

Bacon.js is a library for functional reactive programming. Or let's say it's a library for
working with [events](#event) and dynamic values (which are called [Properties](#property) in Bacon.js).

Anyways, you can wrap an event source,
say "mouse clicks on an element" into an [`EventStream`](#eventstream) by saying

```js
var clicks = $("h1").asEventStream("click")
```

Each EventStream represents a stream of events. It is an Observable object, meaning
that you can listen to events in the stream using, for instance, the [`onValue`](#stream-onvalue) method
with a callback. Like this:

```js
clicks.onValue(function() { alert("you clicked the h1 element") })
```

But you can do neater stuff too. The Bacon of bacon.js is in that you can transform,
filter and combine these streams in a multitude of ways (see API below). The methods [`map`](#observable-map),
[`filter`](#observable-filter), for example, are similar to same functions in functional list programming
(like [Underscore](http://underscorejs.org/)). So, if you say

```js
var plus = $("#plus").asEventStream("click").map(1)
var minus = $("#minus").asEventStream("click").map(-1)
var both = plus.merge(minus)
```

.. you'll have a stream that will output the number 1 when the "plus" button is clicked
and another stream outputting -1 when the "minus" button is clicked. The `both` stream will
be a merged stream containing events from both the plus and minus streams. This allows
you to subscribe to both streams with one handler:

```js
both.onValue(function(val) { /* val will be 1 or -1 */ })
```

In addition to EventStreams, bacon.js has a thing called [`Property`](#property), that is almost like an
EventStream, but has a "current value". So things that change and have a current state are
Properties, while things that consist of discrete events are EventStreams. You could think
mouse clicks as an EventStream and mouse position as a Property. You can create Properties from
an EventStream with [`scan`](#observable-scan) or [`toProperty`](#stream-toproperty) methods. So, let's say

```js
function add(x, y) { return x + y }
var counter = both.scan(0, add)
counter.onValue(function(sum) { $("#sum").text(sum) })
```

The `counter` property will contain the sum of the values in the `both` stream, so it's practically
a counter that can be increased and decreased using the plus and minus buttons. The [`scan`](#observable-scan) method
was used here to calculate the "current sum" of events in the `both` stream, by giving a "seed value"
`0` and an "accumulator function" `add`. The scan method creates a property that starts with the given
seed value and on each event in the source stream applies the accumulator function to the current
property value and the new value from the stream.

Properties can be very conveniently used for assigning values and attributes to DOM elements with JQuery.
Here we assign the value of a property as the text of a span element whenever it changes:

```js
property.assign($("span"), "text")
```

Hiding and showing the same span depending on the content of the property value is equally straightforward

```js
function hiddenForEmptyValue(value) { return value == "" ? "hidden" : "visible" }
property.map(hiddenForEmptyValue).assign($("span"), "css", "visibility")
```

In the example above a property value of "hello" would be mapped to "visible", which in turn would result in Bacon calling

```js
$("span").css("visibility", "visible")
```

For an actual tutorial, please check out my [blog posts](http://nullzzz.blogspot.fi/2012/11/baconjs-tutorial-part-i-hacking-with.html)

API
===

TODO: correct references to the new typedocs
TODO: Observable, EventStream, Property

Creating streams
----------------

<a name="$-aseventstream"></a>
<a name="bacon-frompromise"></a>
<a name="bacon-fromevent"></a>
<a name="bacon-fromcallback"></a>
<a name="bacon-fromnodecallback"></a>
<a name="bacon-fromesobservable"></a>
<a name="bacon-frompoll"></a>
<a name="bacon-once"></a>
<a name="bacon-fromarray"></a>
<a name="bacon-interval"></a>
<a name="bacon-sequentially"></a>
<a name="bacon-repeatedly"></a>
<a name="bacon-repeat"></a>
<a name="bacon-never"></a>
<a name="bacon-later"></a>
<a name="bacon-frombinder"></a>


Combining multiple streams and properties
-----------------------------------------

<a name="bacon-combineasarray"></a>
<a name="bacon-combinewith"></a>
<a name="bacon-combinetemplate"></a>
<a name="bacon-mergeall"></a>
<a name="bacon-concatall"></a>
<a name="bacon-zipasarray"></a>
<a name="bacon-zipwith"></a>
<a name="bacon-onvalues"></a>

Function Construction rules
---------------------------

Function construction rules, which allowed you to use string shorthands for properties and methods,
were removed in version 3.0, as they are not as useful as they used to be, due to the moderd, short
lambda syntax in ES6 and Typescript, as well as libraries like Ramda and partial.lenses.

Lazy evaluation
---------------

Lazy evaluation of event values has been removed in version 2.0

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

[`Bus`](#bus) is an [`EventStream`](#eventstream) that allows you to [`push`](#bus-push) values into the stream.
It also allows plugging other streams into the Bus. The Bus practically
merges all plugged-in streams and the values pushed using the [`push`](#bus-push)
method.

Event
-----


Errors
------

[`Error`](classes/error.html) events are always passed through all stream combinators. So, even
if you filter all values out, the error events will pass through. If you
use flatMap, the result stream will contain Error events from the source
as well as all the spawned stream.

You can take action on errors by using the [`observable.onError(f)`](#observable-onerror)
callback.

See documentation on [`onError`](#observable-onerror), [`mapError`](#observable-maperror), [`errors`](#errors), [`skipErrors`](#observable-skiperrors), [`Bacon.retry`](#bacon-retry) and [`flatMapError`](#observable-flatmaperror) above.

In case you want to convert (some) value events into [`Error`](#bacon-error) events, you may use [`flatMap`](#observable-flatmap) like this:

```js
stream = Bacon.fromArray([1,2,3,4]).flatMap(function(x) {
  if (x > 2)
    return new Bacon.Error("too big")
  else
    return x
})
```

Conversely, if you want to convert some [`Error`](#bacon-error) events into value events, you may use [`flatMapError`](#observable-flatmaperror):

```js
myStream.flatMapError(function(error) {
  return isNonCriticalError(error) ? handleNonCriticalError(error) : new Bacon.Error(error)
})
```

Note also that Bacon.js combinators do not catch errors that are thrown.
Especially [`map`](#observable-map) doesn't do so. If you want to map things
and wrap caught errors into Error events, you can do the following:

```js
wrapped = source.flatMap(Bacon.try(dangerousOperation))
```

For example, you can use `Bacon.try` to handle JSON parse errors:

```js
var jsonStream = Bacon
  .once('{"this is invalid json"')
  .flatMap(Bacon.try(JSON.parse))

jsonStream.onError(function(err) {
  console.error("Failed to parse JSON", err)
})
```

An Error does not terminate the stream. The method [`observable.endOnError()`](#observable-endonerror)
returns a stream/property that ends immediately after first error.

Bacon.js doesn't currently generate any [`Error`](#bacon-error) events itself (except when
converting errors using Bacon.fromPromise). Error
events definitely would be generated by streams derived from IO sources
such as AJAX calls.

See [retry](globals.html#retry) for retrying on error.


Introspection and metadata
--------------------------

Bacon.js provides ways to get some descriptive metadata about all Observables.

<a name="observable-tostring"></a>

<a name="observable-deps"></a>

<a name="observable-internaldeps"></a>

<a name="observable-desc"></a>

<a name="bacon-spy"></a>

Cleaning up
-----------

As described above, a subscriber can signal the loss of interest in new events
in any of these two ways:

1. Return [`Bacon.noMore`](#bacon-nomore) from the handler function
2. Call the `dispose()` function that was returned by the `subscribe()`
   call.

Based on my experience, an actual side-effect subscriber
in application-code almost never does this. Instead you'll use methods like [takeUntil](globals.html#takeuntil)
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
   value is wrapped into a [`Next`](#bacon-next) event.
2. The subscriber function returns a result which is either [`Bacon.noMore`](#bacon-nomore) or
[`Bacon.more`](#bacon-more). The `undefined` value is handled like [`Bacon.more`](#bacon-more).
3. In case of [`Bacon.noMore`](#bacon-nomore) the source must never call the subscriber again.
4. When the stream ends, the subscriber function will be called with
   and [`Bacon.End`](#bacon-end) event. The return value of the subscribe function is
   ignored in this case.

A [`Property`](#property) behaves similarly to an [`EventStream`](#eventstream) except that

1. On a call to `subscribe`, it will deliver its current value
(if any) to the provided subscriber function wrapped into an [`Initial`](#bacon-initial)
event.
2. This means that if the Property has previously emitted the value `x`
to its subscribers and that is the latest value emitted, it will deliver
this value to the new subscriber.
3. Property may or may not have a current value to start with. Depends
on how the Property was created.

Atomic updates
--------------

Bacon.js supports atomic updates to properties.

Assume you have properties A and B and property C = A + B. Assume that
both A and B depend on D, so that when D changes, both A and B will
change too.

When D changes `d1 -> d2`, the value of A `a1 -> a2` and B changes `b1
-> b2` simultaneously, you'd like C to update atomically so that it
would go directly `a1+b1 -> a2+b2`. And, in fact, it does exactly that.
Prior to version 0.4.0, C would have an additional transitional
state like `a1+b1 -> a2+b1 -> a2+b2`

For RxJs Users
--------------

Bacon.js is quite similar to RxJs, so it should be pretty easy to pick up. The
major difference is that in bacon, there are two distinct kinds of Observables:
the EventStream and the Property. The former is for discrete events while the
latter is for observable properties that have the concept of "current value".

Also, there are no "cold observables", which
means also that all EventStreams and Properties are consistent among subscribers:
when as event occurs, all subscribers will observe the same event. If you're
experienced with RxJs, you've probably bumped into some wtf's related to cold
observables and inconsistent output from streams constructed using scan and startWith.
None of that will happen with bacon.js.

Error handling is also a bit different: the Error event does not
terminate a stream. So, a stream may contain multiple errors. To me,
this makes more sense than always terminating the stream on error; this
way the application developer has more direct control over error
handling. You can always use [`stream.endOnError()`](#observable-endonerror) to get a stream
that ends on error!

Examples
========

See [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)

See [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/specs/main.coffee)

See Worzone [demo](http://juhajasatu.com/worzone/) and [source](http://github.com/raimohanska/worzone)

Build
=====


First check out the Bacon.js repository and run `npm install`.

Then build the coffeescript sources into javascript:

    npm run dist

Result javascript files will be generated in `dist` directory. If your planning
to develop Bacon.js yourself, you'll want to run [tests] too.

You can also build a bundle with selected features only. For instance

    scripts/dist flatmap combine takeuntil

The build system will do its best to determine the dependencies of the selected
features and include those into the bundle too. You can also test the integrity
of the bundle with your selected features using

    scripts/runtests flatmap combine takeuntil

TODO: partial testing currently broken.


Test
====

Run all unit tests:

    ./test

Run limited set of unit tests:

    ./test core _ frompromise

The names correspond to the file names under `spec/specs`. The library will
be built with the listed features only.

You can also test all features individually:

    ./test-individually.js

This will loop thru all files under `spec/specs` and build the library with the
single feature and run the test.

Run browser tests (using testem):

    npm install
    npm install -g testem
    testem

Run browser (without testem):

    npm install
    browsertest/browserify
    open browsertest/mocha.runner.html

Run performance tests:

    performance/PerformanceTest.coffee
    performance/PerformanceTest.coffee flatmap

Run memory usage tests:

    coffee --nodejs '--expose-gc' performance/MemoryTest.coffee

Dependencies
============

Runtime: jQuery or Zepto.js (optional; just for jQ/Zepto bindings)
Build/test: node.js, npm, coffeescript

Compatibility with other libs
=============================

Bacon.js doesn't mess with prototypes or the global object. Only exceptions below.

* It exports the Bacon object, except in Node.js. In a browser, this is added to the window object.
* If jQuery is defined, it adds the asEventStream method to jQuery (similarly to Zepto)

So, it should be pretty much compatible and a nice citizen.

I'm not sure how it works in case some other lib adds stuff to, say, Array prototype, though. Maybe add test for this later?

Compatibility with browsers
===========================

TLDR: good.

Bacon.js is not browser dependent, because it is not a UI library.

I have personally used it Bacon.js with Chrome, Firefox, Safari, IE 6+, iPhone, iPad.

Automatically tested on each commit on modern browsers.


Node.js
=======

Sure. Works. Try it out.

    npm install baconjs

Then type `node` and try the following

```js
Bacon = require("baconjs").Bacon
Bacon.sequentially(1000, ["B", "A", "C", "O", "N"]).log()
```

AMD
===

Yep. Currently exports Bacon through AMD and assigns to `window` for backwards
compatibility.

If you would like to use it with jQuery and AMD, you should monkey patch jQuery
explicitly so that module loading order does not matter

```js
define(function (require) {
    var $ = require('jquery'),
        Bacon = require('Bacon');

    $.fn.asEventStream = Bacon.$.asEventStream;

    $(document).asEventStream('click').onValue(function (e) {
        console.log(e.clientX + ', ' + e.clientY);
    });
});
```

Why Bacon?
==========

Bacon.js exists largely because I got frustrated with RxJs, which is a good library, but at that time
didn't have very good documentation and wasn't open-source. Things have improved a lot in the Rx
world since that. Yet, there are still compelling reasons to use Bacon.js instead. Like, for instance,
more consistent stream/property behavior and (arguably) simplicity of use.

Contribute
==========

Use [GitHub issues](https://github.com/baconjs/bacon.js/issues) and [Pull Requests](https://github.com/baconjs/bacon.js/pulls).

Note: this readme is generated from `readme-src.coffee`. After updating the src file, run `npm run readme`.


Sponsors
========

Thanks to [BrowserStack](http://www.browserstack.com) for kindly providing me with free of charge automatic testing time.

Thanks also to [Reaktor](https://reaktor.com/) for supporting Bacon.js development and letting me use some of my working hours on open-source development.

<a href="https://reaktor.com/"><img src="https://baconjs.github.io/supported-by-reaktor.png" /></a>
