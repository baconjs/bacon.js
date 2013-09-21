﻿Bacon.js
========

<img src="/logo.png" align="right" width="300px" />

A small functional reactive programming lib for JavaScript.

Turns your event spaghetti into clean and declarative feng shui bacon, by switching
from imperative to functional. It's like replacing nested for-loops with functional programming
concepts like `map` and `filter`. Stop working on individual events and work with event streams instead.
Transform your data with `map` and `filter`. Combine your data with `merge` and `combine`.
Then switch to the heavier weapons and wield `flatMap` and `combineTemplate` like a boss.

It's the `_` of Events. Too bad the symbol `~` is not allowed in Javascript.

Here's the stuff.

- [CoffeeScript source](https://github.com/baconjs/bacon.js/blob/master/src/Bacon.coffee)
- [Generated javascript](https://github.com/baconjs/bacon.js/blob/master/dist/)
- [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/BaconSpec.coffee)
- [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)
- [Wiki](https://github.com/baconjs/bacon.js/wiki/) with more docs, related projects and more
- [Cheat Sheet](http://www.cheatography.com/proloser/cheat-sheets/bacon-js/)
- [My Blog](http://nullzzz.blogspot.com) with some baconful and reactive postings along with a Bacon.js tutorial
- [TodoMVC with Bacon.js and jQuery](https://github.com/raimohanska/todomvc/blob/bacon-jquery/labs/architecture-examples/baconjs/js/app.js)

You can also check out my entertaining (LOL), interactive, solid-ass [slideshow](http://raimohanska.github.com/bacon.js-slides/).

And remember to give me feedback on the bacon! Let me know if you've
used it. Tell me how it worked for you. What's missing? What's wrong?
Please contribute!

[![Build Status](https://travis-ci.org/baconjs/bacon.js.png)](https://travis-ci.org/baconjs/bacon.js)

Install
=======

You can download the latest [generated javascript](https://raw.github.com/baconjs/bacon.js/master/dist/Bacon.js).

Version 0.6.8 can also be found from cdnjs hosting:

    http://cdnjs.cloudflare.com/ajax/libs/bacon.js/0.6.8/Bacon.js
    http://cdnjs.cloudflare.com/ajax/libs/bacon.js/0.6.8/Bacon.min.js

If you're targeting to [node.js](http://nodejs.org/), you can

    npm install baconjs

For [bower](https://github.com/twitter/bower) users:

    bower install bacon
    
Intro
=====

The idea of Functional Reactive Programming is quite well described by Conal Elliot at [Stack Overflow](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming/1030631#1030631).

Bacon.js is a library for functional reactive programming. Or let's say it's a library for
working with events and dynamic values (which are called Properties in Bacon.js).

Anyways, you can wrap an event source,
say "mouse clicks on an element" into an `EventStream` by saying

```js
var cliks = $("h1").asEventStream("click")
```

Each EventStream represents a stream of events. It is an Observable object, meaning
that you can listen to events in the stream using, for instance, the `onValue` method
with a callback. Like this:

```js
cliks.onValue(function() { alert("you clicked the h1 element") })
```

But you can do neater stuff too. The Bacon of bacon.js is in that you can transform,
filter and combine these streams in a multitude of ways (see API below). The methods `map`,
`filter`, for example, are similar to same functions in functional list programming
(like [Underscore](http://documentcloud.github.com/underscore/)). So, if you say

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

In addition to EventStreams, bacon.js has a thing called `Property`, that is almost like an
EventStream, but has a "current value". So things that change and have a current state are
Properties, while things that consist of discrete events are EventStreams. You could think
mouse clicks as an EventStream and mouse position as a Property. You can create Properties from
an EventStream with `scan` or `toProperty` methods. So, let's say

```js
function add(x, y) { return x + y }
var counter = both.scan(0, add)
counter.onValue(function(sum) { $("#sum").text(sum) })
```

The `counter` property will contain the sum of the values in the `both` stream, so it's practically
a counter that can be increased and decreased using the plus and minus buttons. The `scan` method
was used here to calculate the "current sum" of events in the `both` stream, by giving a "seed value"
`0` and an "accumulator function" `add`. The scan method creates a property that starts with the given
seed value and on each event in the source stream applies the accumulator function to the current
property value and the new value from the stream.

Properties can be very conventiently used for assigning values and attributes to DOM elements with JQuery.
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

Creating streams
----------------

`$.asEventStream("click")` creates an EventStream from events on a
jQuery or Zepto.js object. You can pass optional arguments to add a
jQuery live selector and/or a function that processes the jQuery
event and its parameters, if given, like this:

```js
$("#my-div").asEventStream("click", ".more-specific-selector")
$("#my-div").asEventStream("click", ".more-specific-selector", function(event, args) { return args[0] })
$("#my-div").asEventStream("click", function(event, args) { return args[0] })
```

`Bacon.fromPromise(promise [, abort])` creates an EventStream from a Promise object such as JQuery Ajax. 
This stream will contain a single value or an error, followed immediately by stream end.  You can use the optional abort flag (i.e. ´fromPromise(p, true)´ to have the `abort` method of the given promise be called when all subscribers have been removed from the created stream.
Check out this [example](https://github.com/raimohanska/baconjs-examples/blob/master/resources/public/index.html).

`Bacon.fromEventTarget(target, eventName [, eventTransformer])` creates an EventStream from events
on a DOM EventTarget or Node.JS EventEmitter object. You can also pass an optional function that transforms the emitted
events' parameters.

```js
Bacon.fromEventTarget(document.body, "click").onValue(function() { alert("Bacon!") })
```

`Bacon.fromCallback(f [, args...])` creates an Event stream from a function that
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

You can also give any number of arguments to `fromCallback`, which will be
passed to the function. These arguments can be simple variables, Bacon
EventStreams or Properties. For example the following will output "Bacon rules":

```js
bacon = Bacon.constant('bacon')
Bacon.fromCallback(function(a, b, callback) {
  callback(a + ' ' + b);
}, bacon, 'rules').log();
```

`Bacon.fromCallback(object, methodName [, args...])` a variant of
fromCallback which calls the named method of a given object.

`Bacon.fromNodeCallback(f [, args...])` behaves the same way as `Bacon.fromCallback`,
except that it expects the callback to be called in the Node.js convention:
`callback(error, data)`, where error is null if everything is fine. For example:

```js
var Bacon = require('baconjs').Bacon,
    fs = require('fs');
var read = Bacon.fromNodeCallback(fs.readFile, 'input.txt');
read.onError(function(error) { console.log("Reading failed: " + error); });
read.onValue(function(value) { console.log("Read contents: " + value); });
```

`Bacon.fromNodeCallback(object, methodName [, args...])` a variant of
fromNodeCallback which calls the named method of a given object.

`Bacon.fromPoll(interval, f)` polls given function with given interval.
Function should return Events: either Bacon.Next or Bacon.End. Polling occurs only
when there are subscribers to the stream. Polling ends permanently when
`f` returns Bacon.End

`Bacon.once(value)` creates an EventStream that delivers the given
single value for the first subscriber. The stream will end immediately
after this value. 

`Bacon.fromArray(values)` creates an EventStream that delivers the given
series of values to the first subscriber. The stream ends after these
values have been delivered.

`Bacon.interval(interval, value)` repeats the single element
indefinitely with the given interval (in milliseconds)

`Bacon.sequentially(interval, values)` creates a stream containing given
values (given as array). Delivered with given interval in milliseconds.

`Bacon.repeatedly(interval, values)` repeats given elements indefinitely
with given interval in milliseconds. For example, repeatedly(10, [1,2,3])
would lead to 1,2,3,1,2,3... to be repeated indefinitely.

`Bacon.never()` creates an EventStream that immediately ends.

`Bacon.later(delay, value)` creates a single-element stream that
produces given value after given delay (milliseconds).

`new Bacon.EventStream(subscribe)` creates an event stream with the given
subscribe function. (See below)

`property.changes()` creates a stream of changes to the Property (see Property API below)

`new Bacon.Bus()` creates a pushable/pluggable stream (see Bus section
below)

Pro tip: you can also put Errors into streams created with the
constructors above, by using an `Bacon.Error` object instead of a plain
value.

The EventStream constructor for custom streams
----------------------------------------------

If none of the factory methods above apply, you may of course roll your own EventStream by using the constructor:

```js
new EventStream(subscribe)
```

The parameter `subscribe` is a function that accepts an subscriber which is a function that will receive Events.

For example:

```js
new Bacon.EventStream(function(subscriber) {
  subscriber(new Bacon.Next("a value here"))
  subscriber(new Bacon.Next(function() {
    return "This one will be evaluated lazily"
  }))
  subscriber(new Bacon.Error("oops, an error"))
  subscriber(new Bacon.End())
  return function() { /* unsub functionality here, this one's a no-op */ }
})
```

The subscribe function must return a function. Let's call that function
`unsubscribe`. The returned function can be used by the subscriber to
unsubscribe and it should release all resources that the subscribe function reserved.

The subscriber function may return Bacon.more or Bacon.noMore. It may also
return undefined or anything else. Iff it returns Bacon.noMore, the subscriber
must be cleaned up just like in case of calling the unsubscribe function.

The EventStream constructor will wrap your subscribe function so that it will
only be called when the first stream listener is added, and the unsubscibe
function is called only after the last listener has been removed.
The subscribe-unsubscribe cycle may of course be repeated indefinitely,
so prepare for multiple calls to the subscribe function.

A note about the `new Bacon.Next(..)` constructor: You can use it like

```js
new Bacon.Next("value")
```

But the canonical way would be
```js
new Bacon.Next(function() { return "value") })
```

The former version is safe only when you know that the actual value in
the stream is not a function.

The idea in using a function instead of a plain value is that the internals on Bacon.js take
advantage of lazy evaluation by deferring the evaluations of values
created by `map`, `combine`.

Common methods in EventStreams and Properties
---------------------------------------------

Both EventStream and Property share the Observable interface, and hence
share a lot of methods. Common methods are listed below.

`observable.map(f)` maps values using given function, returning a new
EventStream. Instead of a function, you can also provide a constant
value. Further, you can use a property extractor string like
".keyCode". So, if f is a string starting with a
dot, the elements will be mapped to the corresponding field/function in the event
value. For instance map(".keyCode") will pluck the keyCode field from
the input values. If keyCode was a function, the result stream would
contain the values returned by the function. The Function Construction
rules below apply here.

`stream.map(property)` maps the stream events to the current value of
the given property. This is equivalent to `property.sampledBy(stream)`.

`observable.mapError(f)` maps errors using given function. More
specifically, feeds the "error" field of the error event to the function
and produces a "Next" event based on the return value. Function
Construction rules apply. You can omit the argument to
produce a Next event with `undefined` value.

`observable.mapEnd(f)` Adds an extra Next event just before End. The value is created
by calling the given function when the source stream ends. Instead of a
function, a static value can be used. You can omit the argument to
produce a Next event with `undefined` value.

`observable.filter(f)` filters values using given predicate function.
Instead of a function, you can use a constant value (true/false) or a
property extractor string (like ".isValuable") instead. Just like with
`map`, indeed.

`observable.filter(property)` filters values based on the value of a
property. Event will be included in output iff the property holds `true`
at the time of the event.

`observable.takeWhile(f)` takes while given predicate function holds
true. Function Construction rules apply.

`observable.takeWhile(property)` takes values while the value of a
property holds `true`.

`observable.take(n)` takes at most n elements from the stream. Equals to
Bacon.never() if n <= 0.

`observable.takeUntil(stream2)` takes elements from source until a Next event
appears in the other stream. If other stream ends without value, it is
ignored

`observable.skip(n)` skips the first n elements from the stream

`observable.delay(delay)` delays the stream/property by given amount of milliseconds. Does not delay the initial value of a Property.

```js
var delayed = source.delay(2)
```

```
source:    asdf----asdf----
delayed:   --asdf----asdf--
```

`observable.throttle(delay)` throttles stream/property by given amount
of milliseconds. Events are emitted with the minimum interval of
`delay`. The implementation is based on stream.bufferWithTime.
Does not affect emitting the initial value of a Property.

Example:

```js
var throttled = source.throttle(2)
```

```
source:    asdf----asdf----
throttled: --s--f----s--f--
```

`observable.debounce(delay)` throttles stream/property by given amount
of milliseconds, but so that event is only emitted after the given
"quiet period". Does not affect emitting the initial value of a Property.
The difference of `throttle` and `debounce` is the same as it is in the
same methods in jQuery.

Example:

```
source:             asdf----asdf----
source.debounce(2): -----f-------f--
```

`observable.debounceImmediate(delay)` passes the first event in the
stream through, but after that, only passes events after a given number
of milliseconds have passed since previous output.

Example:

```
source:                      asdf----asdf----
source.debounceImmediate(2): a-d-----a-d-----
```

`observable.doAction(f)` returns a stream/property where the function f
is executed for each value, before dispatching to subscribers. This is
useful for debugging, but also for stuff like calling the
preventDefault() method for events. In fact, you can
also use a property-extractor string instead of a function, as in
".preventDefault".

`observable.not()` returns a stream/property that inverts boolean
values

`observable.flatMap(f)` for each element in the source stream, spawn a new
stream using the function `f`. Collect events from each of the spawned
streams into the result `EventStream`. This is very similar to selectMany in
RxJs. Note that instead of a function, you can provide a
stream/property too. Also, the return value of function `f` can be either an 
Observable (stream/property) or a constant value. The result of
`flatMap` is always an `EventStream`.

stream.flatMap() can be used conveniently with `Bacon.once()` and `Bacon.never()` for converting and filtering at the same time, including only some of the results.

Example - converting strings to integers, skipping empty values:

```js
stream.flatMap(function(text) {
    return (text != "") ? parseInt(text) : Bacon.never()
})
```

`observable.flatMapLatest(f)` like flatMap, but instead of including events from
all spawned streams, only includes them from the latest spawned stream.
You can think this as switching from stream to stream. The old name for
this method is `switch`. Note that instead of a function, you can
provide a stream/property too.

`observable.flatMapFirst(f)` like flatMap, but doesn't spawns a new
stream only if the previously spawned stream has ended.

`observable.scan(seed, f)` scans stream/property with given seed value and
accumulator function, resulting to a Property. For example, you might
use zero as seed and a "plus" function as the accumulator to create
an "integral" property. Instead of a function, you can also supply a
method name such as ".concat", in which case this method is called on
the accumulator value and the new stream value is used as argument.

Example:

```js
var plus = function (a,b) { return a + b }
Bacon.sequentially(1, [1,2,3]).scan(0, plus)
```

This would result to following elements in the result stream:

    seed value = 0
    0 + 1 = 1
    1 + 2 = 3
    3 + 3 = 6

When applied to a Property as in `r = p.scan(f,seed)`, there's a (hopefully insignificant) catch:
The starting value for `r` depends on whether `p` has an
initial value when scan is applied. If there's no initial value, this works
identically to EventStream.scan: the `seed` will be the initial value of
`r`. However, if `r` already has a current/initial value `x`, the
seed won't be output as is. Instead, the initial value of `r` will be `f(seed, x)`. This makes sense,
because there can only be 1 initial value for a Property at a time.

`observable.fold(seed, f)` is like `scan` but only emits the final
value, i.e. the value just before the observable ends. Returns a
Property.

`observable.reduce(seed,f)` synonym for `fold`.

`observable.diff(start, f)` returns a Property that represents the result of a comparison
between the previous and current value of the Observable. For the initial value of the Observable,
the previous value will be the given start.

Example:

```js
var distance = function (a,b) { return Math.abs(b - a) }
Bacon.sequentially(1, [1,2,3]).diff(0, distance)
```

This would result to following elements in the result stream:

    1 - 0 = 1
    2 - 1 = 1
    3 - 2 = 1

`observable.zip(other, f)` return an EventStream with elements
pair-wise lined up with events from this and the other stream.
A zipped stream will publish only when it has a value from each
stream and will only produce values up to when any single stream ends.

Be careful not to have too much "drift" between streams. If one stream
produces many more values than some other excessive buffering will
occur inside the zipped observable.

Example 1:

```js
var x = Bacon.fromArray([1, 2])
var y = Bacon.fromArray([3, 4])
x.zip(y, function(x, y) { return x + y })

# produces values 4, 6
```

Example 2:

You can use zip to combine observables that are pairwise synchronized
from e.g. projections or sampling by the same property, while avoiding
the double-processing that would happen recombining with `combine`.

```js
var x = obs.map('.x')
var y = obs.map('.y')
x.zip(y, makeComplex)
```

`observable.slidingWindow(max[, min])` returns a Property that represents a
"sliding window" into the history of the values of the Observable. The
result Property will have a value that is an array containing the last `n`
values of the original observable, where `n` is at most the value of the
`max` argument, and at least the value of the `min` argument. If the
`min` argument is omitted, there's no lower limit of values.

For example, if you have a stream `s` with value a sequence 1 - 2 - 3 - 4 - 5, the
respective values in `s.slidingWindow(2)` would be [] - [1] - [1,2] -
[2,3] - [3,4] - [4,5]. The values of `s.slidingWindow(2,2)`would be
[1,2] - [2,3] - [3,4] - [4,5].

`observable.log()` logs each value of the Observable to the console.
It optionally takes arguments to pass to console.log() alongside each
value. To assist with chaining, it returns the original Observable. Note
that as a side-effect, the observable will have a constant listener and
will not be garbage-collected. So, use this for debugging only and
remove from production code. For example:

```js
myStream.log("New event in myStream")
```

or just

```js
myStream.log()
```

`observable.combine(property2, f)` combines the latest values of the two
streams or properties using a two-arg function. Similarly to `scan`, you can use a
method name instead, so you could do `a.combine(b, ".concat")` for two
properties with array value. The result is a Property.

`observable.withStateMachine(initState, f)` lets you run a state machine
on an observable. Give it an initial state object and a state
transformation function that processes each incoming event and 
returns and array containing the next state and an array of output
events. Here's an an example, where we calculate the total sum of all
numbers in the stream and output the value on stream end:

```js
Bacon.fromArray([1,2,3])
  .withStateMachine(0, function(sum, event) {
    if (event.hasValue())
      return [sum + event.value(), []]
    else if (event.isEnd())
      return [undefined, [new Bacon.Next(sum), event]]
    else
      return [sum, [event]]
  })
```

`observable.decode(mapping)` decodes input using the given mapping. Is a
bit like a switch-case or the decode function in Oracle SQL. For
example, the following would map the value 1 into the the string "mike"
and the value 2 into the value of the `who` property.

```js
property.decode({1 : "mike", 2 : who})
```

This is actually based on `combineTemplate` so you can compose static
and dynamic data quite freely, as in

```js
property.decode({1 : { type: "mike" }, 2 : { type: "other", whoThen : who }})
```

The return value of `decode` is always a `Property`.

`observable1.awaiting(observable2)` creates a Property that indicates whether
observable1 is awaiting observable2, i.e. has produced a value after the latest
value from observable2. This is handy for keeping track whether we are
currently awaiting an AJAX response:

```js
var showAjaxIndicator = ajaxRequest.awaiting(ajaxResponse)
```

`observable.endOnError` ends the Observable on first Error event. The
error is included in the output of the returned Observable.

`observable.endOnError(f)` ends the Observable on first error for which
the given predicate function returns true. The error is included in the 
output of the returned Observable. Function construction rules apply, so
you can do for example `.endOnError(".serious")`.

`observable.withHandler(f)` lets you do more custom event handling: you
get all events to your function and you can output any number of events
and end the stream if you choose. For example, to send an error and end
the stream in case a value is below zero:

```js
if (event.hasValue() && event.value() < 0) {
  this.push(new Bacon.Error("Value below zero"));
  return this.push(end());
} else {
  return this.push(event);
}
```

Note that it's important to return the value from `this.push` so that
the connection to the underlying stream will be closed when no more
events are needed.

EventStream
-----------

`Bacon.EventStream` a stream of events. See methods below.

`stream.onValue(f)` subscribes a given handler function to event
stream. Function will be called for each new value in the stream. This
is the simplest way to assign a side-effect to a stream. The difference
to the `subscribe` method is that the actual stream values are
received, instead of Event objects. Function Construction rules below
apply here.

`stream.onValues(f)` like onValue, but splits the value (assuming its an
array) as function arguments to `f`

`stream.onEnd(f)` subscribes a callback to stream end. The function will
be called when the stream ends.

`stream.subscribe(f)` subscribes given handler function to
event stream. Function will receive Event objects (see below).
The subscribe() call returns a `unsubscribe` function that you can
call to unsubscribe. You can also unsubscribe by returning
`Bacon.noMore` from the handler function as a reply to an Event.

`stream.skipDuplicates([isEqual])` drops consecutive equal elements. So,
from [1, 2, 2, 1] you'd get [1, 2, 1]. Uses the === operator for equality
checking by default. If the isEqual argument is supplied, checks by calling
isEqual(oldValue, newValue). For instance, to do a deep comparison,you can
use the isEqual function from [underscore.js](http://underscorejs.org/)
like `stream.skipDuplicates(_.isEqual)`.

`stream1.concat(stream2)` concatenates two streams into one stream so that
it will deliver events from `stream1` until it ends and then deliver
events from `stream2`. This means too that events from `stream2`,
occurring before the end of `stream1` will not be included in the result
stream.

`stream.merge(stream2)` merges two streams into one stream that delivers
events from both

`stream.startWith(value)` adds a starting value to the stream, i.e. concats a 
single-element stream contains `value` with this stream.

`stream.skipWhile(f)` skips elements while given predicate function holds true. Function construction rules apply. 

`stream.skipWhile(property)` skips elements while the value of the given
Property is `true`.

`stream.skipUntil(stream2)` skips elements from `stream` until a Next event
appears in `stream2`. In other words, starts delivering values
from `stream` after first event appears in `stream2`.

`stream.bufferWithTime(delay)` buffers stream events with given delay.
The buffer is flushed at most once in the given delay. So, if your input
contains [1,2,3,4,5,6,7], then you might get two events containing [1,2,3,4]
and [5,6,7] respectively, given that the flush occurs between numbers 4 and 5.

`stream.bufferWithTime(f)` works with a given "defer-function" instead
of a delay. Here's a simple example, which is equivalent to
stream.bufferWithTime(10):

```js
stream.bufferWithTime(function(f) { setTimeout(f, 10) })
```

`stream.bufferWithCount(count)` buffers stream events with given count.
The buffer is flushed when it contains the given number of elements. So, if
you buffer a stream of [1, 2, 3, 4, 5] with count 2, you'll get output
events with values [1, 2], [3, 4] and [5].

`stream.bufferWithTimeOrCount(delay, count)` buffers stream events and
flushes when either the buffer contains the given number elements or the
given amount of milliseconds has passed since last buffered event.

`stream.toProperty()` creates a Property based on the
EventStream. Without arguments, you'll get a Property without an initial value.
The Property will get its first actual value from the stream, and after that it'll
always have a current value.

`stream.toProperty(initialValue)` creates a Property based on the
EventStream with the given initial value that will be used as the current value until
the first value comes from the stream.

Property
--------

`Bacon.Property` a reactive property. Has the concept of "current value".
You can create a Property from an EventStream by using either toProperty
or scan method. Note depending on how a Property is created, it may or may not
have an initial value.

`Bacon.constant(x)` creates a constant property with value x.

`property.subscribe(f)` subscribes a handler function to property. If there's
a current value, an `Initial` event will be pushed immediately. `Next`
event will be pushed on updates and an `End` event in case the source
EventStream ends.

`property.onValue(f)` similar to eventStream.onValue, except that also
pushes the initial value of the property, in case there is one.
See Function Construction rules below for different forms of calling this method.

`property.onValues(f)` like onValue, but splits the value (assuming its an
array) as function arguments to `f`

`property.onEnd(f)` subscribes a callback to stream end. The function will
be called when the source stream of the property ends.

`property.assign(obj, method, [param...])` calls the method of the given
object with each value of this Property. You can optionally supply
arguments which will be used as the first arguments of the method call.
For instance, if you want to assign your Property to the "disabled"
attribute of a JQuery object, you can do this:

```js
myProperty.assign($("#my-button"), "attr", "disabled")
```

A simpler example would be to toggle the visibility of an element based
on a Property:

```js
myProperty.assign($("#my-button"), "toggle")
```

Note that the `assign` method is actually just a synonym for `onValue` and
the function construction rules below apply to both.

`property.sample(interval)` creates an EventStream by sampling the
property value at given interval (in milliseconds)

`property.sampledBy(stream)` creates an EventStream by sampling the
property value at each event from the given stream. The result
EventStream will contain the property value at each event in the source
stream.

`property.sampledBy(property)` creates a Property by sampling the
property value at each event from the given property. The result
Property will contain the property value at each event in the source
property.

`property.sampledBy(streamOrProperty, f)` samples the property on stream
events. The result values will be formed using the given function
`f(propertyValue, samplerValue)`. You can use a method name (such as
".concat") instead of a function too.

`property.skipDuplicates([isEqual])` drops consecutive equal elements. So,
from [1, 2, 2, 1] you'd get [1, 2, 1]. Uses the === operator for equality
checking by default. If the isEqual argument is supplied, checks by calling
isEqual(oldValue, newValue). The old name for this method was
"distinctUntilChanged".

`property.changes()` returns an EventStream of property value changes.
Returns exactly the same events as the property itself, except any Initial
events. Note that property.changes() does NOT skip duplicate values, use .skipDuplicates() for that.

`property.and(other)` combines properties with the `&&` operator.

`property.or(other)` combines properties with the `||` operator.

`property.startWith(value)` adds an initial "default" value for the
Property. If the Property doesn't have an initial value of it's own, the
given value will be used as the initial value. If the property has an
initial value of its own, the given value will be ignored.

Combining multiple streams and properties
-----------------------------------------

`Bacon.combineAsArray(streams)` combines Properties, EventStreams and
constant values so that the result Property will have an array of all
property values as its value. The input array may contain both Properties
and EventStreams. In the latter case, the stream is first converted into
a Property and then combined with the other properties.

`Bacon.combineAsArray(s1, s2, ...)` just like above, but with streams
provided as a list of arguments as opposed to a single array.

```js
property = Bacon.constant(1)
stream = Bacon.once(2)
constant = 3
Bacon.combineAsArray(property, stream, constant)
# produces the value [1,2,3]
```

`Bacon.combineWith(f, stream1, stream2 ...)` combines given *n* Properties,
EventStreams and constant values using the given n-ary function `f(v1, v2 ...)`.
To calculate the current sum of three numeric Properties, you can do

```js
function sum3(x,y,z) { return x + y + z }
Bacon.combineWith(sum3, p1, p2, p3)
```

`Bacon.combineTemplate(template)` combines Properties, EventStreams and
constant values using a template
object. For instance, assuming you've got streams or properties named
`password`, `username`, `firstname` and `lastname`, you can do

```js
var password, username, firstname, lastname; // <- properties or streams
var loginInfo = Bacon.combineTemplate({
    magicNumber: 3,
    userid: username,
    passwd: password,
    name: { first: firstname, last: lastname }})
```

.. and your new loginInfo property will combine values from all these
streams using that template, whenever any of the streams/properties
get a new value. For instance, it could yield a value such as

```js
{ magicNumber: 3,
  userid: "juha",
  passwd: "easy",
  name : { first: "juha", last: "paananen" }}
```

In addition to combining data from streams, you can include constant
values in your templates.

Note that all Bacon.combine* methods produce a Property instead of an EventStream.
If you need the result as an EventStream you might want to use property.changes()

```js
Bacon.combineWith(function(v1,v2) { .. }, stream1, stream2).changes()
```

`Bacon.mergeAll(streams)` merges given array of EventStreams.
`Bacon.mergeAll(stream1, stream2 ...)` merges given EventStreams.

`Bacon.zipAsArray(streams)` zips the array of stream in to a new
EventStream that will have an array of values from each source stream as
its value. Zipping means that events from each stream are combine
pairwise so that the 1st event from each stream is published first, then
the 2nd event from each. The results will be published as soon as there
is a value from each source stream.

Be careful not to have too much "drift" between streams. If one stream
produces many more values than some other excessive buffering will
occur inside the zipped observable.

Example:

```js
x = Bacon.fromArray([1,2,3])
y = Bacon.fromArray([10, 20, 30])
z = Bacon.fromArray([100, 200, 300])
Bacon.zipAsArray(x, y, z)

# produces values 111, 222, 333
```

`Bacon.zipAsArray(stream1, stream2, ..)` just like above, but with streams
provided as a list of arguments as opposed to a single array.

`Bacon.zipWith(streams, f)` like `zipAsArray` but uses the given n-ary
function to combine the n values from n streams, instead of returning them in an Array.

`Bacon.zipWith(f, stream1, stream1 ...)` just like above, but with streams
provided as a list of arguments as opposed to a single array.

`Bacon.onValues(a, b [, c...], f)` is a shorthand for combining multiple
sources (streams, properties, constants) as array and assigning the
side-effect function f for the values. The following example would log
the number 3.

```js
function f(a, b) { console.log(a + b) }
Bacon.onValues(Bacon.constant(1), Bacon.constant(2), f)
```

Function Construction rules
---------------------------

Many methods in Bacon have a single function as their argument. Many of these
actually accept a wider range of different arguments that they use for
constructing the function.

Here are the different forms you can use, with examples. The basic form
would be

`stream.map(f)` maps values using the function f(x)

As an extension to the basic form, you can use partial application:

`stream.map(f, "bacon")` maps values using the function f(x, y), using
"bacon" as the first argument, and stream value as the second argument.

`stream.map(f, "pow", "smack")` maps values using the function f(x, y,
z), using "pow" and "smack" as the first two arguments and stream value
as the third argument.

Then, you can create method calls like this:

`stream.onValue(object, method)` calls the method having the given name,
with stream value as the argument.

`titleText.onValue($("#title"), "text")` which would call the "text" method of the jQuery object matching to the HTML element with the id "title"

`disableButton.onValue($("#send"), "attr", "disabled")` which would call
the attr method of the #send element, with "disabled" as the first
argument. So if your property has the value `true`, it would call
$("#send").attr("disabled", true)

You can call methods or return field values using a "property extractor"
syntax. With this syntax, Bacon checks the type of the field and if it's indeed a method, it calls it. Otherwise it just returns field value. For example:

`stream.map(".length")` would return the value of the "length" field of
stream values. Would make sense for a stream of arrays. So, you'd get 2
for `["cat", "dog"]`

`stream.map(".stuffs.length")` would pick the length of the "stuffs"
array that is a field in the stream value. For example, you'd get 2 for
`{ stuffs : ["thing", "object"] }`

`stream.map(".dudes.1")` would pick the second object from the nested
"dudes" array. For example, you'd get "jack" for `{ dudes : ["john",
"jack"] }`.

`stream.doAction(".preventDefault")` would call the "preventDefault" method of
stream values.

`stream.filter(".attr", "disabled").not()` would call `.attr("disabled")` on
stream values and filter by the return value. This would practically
inlude only disabled jQuery elements to the result stream.

If none of the above applies, Bacon will return a constant value. For
instance:

`mouseClicks.map({ isMouseClick: true })` would map all events to the
object `{ isMouseClick: true }`

Methods that support function construction include
at least `onValue`, `onError`, `onEnd`, `map`, `filter`, `assign`, `takeWhile`, `mapError` and `doAction`.

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

Bus is an EventStream that allows you to `push` values into the stream.
It also allows pluggin other streams into the Bus. The Bus practically
merges all plugged-in streams and the values pushed using the `push`
method.

`new Bacon.Bus()` returns a new Bus.

`bus.push(x)` pushes the given value to the stream.

`bus.end()` ends the stream. Sends an End event to all subscribers.
After this call, there'll be no more events to the subscribers.
Also, the Bus `push` and `plug` methods have no effect.

`bus.error(e)` sends an Error with given message to all subscribers

`bus.plug(stream)` plugs the given stream to the Bus. All events from
the given stream will be delivered to the subscribers of the Bus.
Returns a function that can be used to unplug the same stream.

The plug method practically allows you to merge in other streams after
the creation of the Bus. I've found Bus quite useful as an event broadcast
mechanism in the
[Worzone](https://github.com/raimohanska/worzone) game, for instance.

Event
-----

`Bacon.Event` has subclasses `Next`, `End`, `Error` and `Initial`

`Bacon.Next` next value in an EventStream or a Property. Call isNext() to
distinguish a Next event from other events.

`Bacon.End` an end-of-stream event of EventStream or Property. Call isEnd() to
distinguish an End from other events.

`Bacon.Error` an error event. Call isError() to distinguish these events
in your subscriber, or use `onError` to react to error events only.
`errorEvent.error` returns the associated error object (usually string).

`Bacon.Initial` the initial (current) value of a Property. Call isInitial() to
distinguish from other events. Only sent immediately after subscription
to a Property.

Event properties and methods:

`event.value()` returns the value associated with a Next or Initial event

`event.hasValue()` returns true for events of type Initial and Next

`event.isNext()` true for Next events

`event.isInitial()` true for Initial events

`event.isEnd()` true for End events

Errors
------

`Error` events are always passed through all stream combinators. So, even
if you filter all values out, the error events will pass though. If you
use flatMap, the result stream will contain Error events from the source
as well as all the spawned stream.

You can take action on errors by using the `observable.onError(f)`
callback.

`observable.errors()` returns a stream containing Error events only.
Same as filtering with a function that always returns false.

See also the `mapError()` function above.

An Error does not terminate the stream. The method `observable.endOnError()`
returns a stream/property that ends immediately after first error.

Bacon.js doesn't currently generate any Error events itself (except when
converting errors using Bacon.fromPromise). Error
events definitely would be generated by streams derived from IO sources
such as AJAX calls.

Join Patterns
-------------

Join patterns are a generalization of the `zip` function. While zip
synchronizes events from multiple streams pairwse, join patterns allow
for implementation of more advanced synchronization patterns. Bacon.js
uses the `Bacon.when` function to convert a list of synchronization
patterns into a resulting event-stream.

`Bacon.when`

Consider implementing a game with discrete time ticks. We want to
handle key-events synchronized on tick-events, with at most one key
event handled per tick. If there are no key events, we want to just
process a tick.

```js
  Bacon.when(
    [tick, keyEvent], function(_, k) { handleKeyEvent(k); handleTick },
    [tick], handleTick)
```

Order is important here. If the [tick] patterns had been written
first, this would have been tried first, and preferred at each tick.

Join patterns are indeed a generalization of zip, and zip is
equivalent to a single-rule join pattern. The following observables
have the same output.

```js
Bacon.zipWith(a,b,c, combine)
Bacon.when([a,b,c], combine)
```

`Bacon.update`

The property version of `Bacon.when`. It requires an initial value and
functions take an extra parameter representing the "current" value.

```js
Bacon.update(
  initial,
  [x,y,z], function(i,x,y,z) { ... },
  [x,y],   function(i,x,y) { ... })
```

**Join patterns as a "chemical machine"**

A quick way to get some intuition for join patterns is to understand
them through an analogy in terms of atoms and molecules. A join
pattern can here be regarded as a recipe for a chemical reaction. Lets
say we have observables `oxygen`, `carbon` and `hydrogen`, where an
event in these spawns an 'atom' of that type into a mixture.

We can state reactions

```js
Bacon.when(
  [oxygen, hydrogen, hydrogen], make_water(),
  [oxygen, carbon],             make_carbon_monoxide(),
)
```

Now, every time a new 'atom' is spawned from one of the observables,
this atom is added to the mixture. If at any time there are two oxygen
atoms, and a hydrogen atom, the corresponding atoms are *consumed*,
and output is produced via `make_water`.

The same semantics apply for the second rule to create carbon
monoxide. The rules are tried at each point from top to bottom. 

**Join patterns and properties**

Properties are not part of the synchronization pattern, but are
instead just sampled. The following example take three input streams
`$price`, `$quantity` and `$total`, e.g. coming from input fields, and
defines mutally recursive behaviours in properties `price`, `quantity`
and `total` such that
  
  - updating price sets total to price * quantity
  - updating quantity sets total to price * quantity
  - updating total sets price to total / quantity

```js
  var $price, $total, $quantity = ...
  
  var quantity = $quantity.toProperty(1)
  
  var price = Bacon.when(
    [$price], id,
    [$total, quantity], function(x,y) { return x/y })
   .toProperty(0)  
  
  var total = Bacon.when(
    [$total], id,
    [$price, quantity], function(x,y) { return x*y },
    [price, $quantity], function(x,y) { return x*y })
   .toProperty(0)
   
```

**Join patterns and Bacon.bus**

The result functions of join patterns are allowed to push values onto
a Bus that may in turn be in one of its patterns. For instance, an
implementation of the dining philosphers problem can be written as
follows.  (http://en.wikipedia.org/wiki/Dining_philosophers_problem)
      
Example: 

```js
// availability of chopsticks are implemented using Bus
var chopsticks = [new Bacon.Bus(), new Bacon.Bus(), new Bacon.Bus()]

// hungry could be any type of observable, but we'll use bus here
var hungry     = [new Bacon.Bus(), new Bacon.Bus(), new Bacon.Bus()]

// a philospher eats for one second, then makes the chopsticks
// available again by pushing values onto their bus.
var eat = function(i) {
  return function() {
    setTimeout(function() {
      console.log('done!')
      chopsticks[i].push({})
      chopsticks[(i+1) % 3].push({})
    }, 1000);
    return 'philosopher ' + i + ' eating'
  } 
}

// we use Bacon.when to make sure a hungry philosopher can eat only
// when both his chopsticks are available. 
var dining = Bacon.when(
  [hungry[0], chopsticks[0], chopsticks[1]],  eat(0),
  [hungry[1], chopsticks[1], chopsticks[2]],  eat(1),
  [hungry[2], chopsticks[2], chopsticks[0]],  eat(2))
  
dining.log()

// make all chopsticks initially available
chopsticks[0].push({}); chopsticks[1].push({}); chopsticks[2].push({})

// make philosophers hungry in some way, in this case we just push to their bus
for (var i = 0; i < 3; i++) {
  hungry[0].push({}); hungry[1].push({}); hungry[2].push({})
} 
```

Cleaning up
-----------

As described above, a subscriber can signal the loss of interest in new events
in any of these two ways:

1. Return `Bacon.noMore` from the handler function
2. Call the `dispose()` function that was returned by the `subscribe()`
   call.

Based on my experience on RxJs coding, an actual side-effect subscriber
in application-code never does this. So the business of unsubscribing is
mostly internal business and you can ignore it unless you're working on
a custom stream implementation or a stream combinator. In that case, I
welcome you to contribute your stuff to bacon.js.

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
   value is wrapped into a `Next` event.
2. The subscriber function returns a result which is either `Bacon.noMore` or
`Bacon.more`. The `undefined` value is handled like `Bacon.more`.
3. In case of `Bacon.noMore` the source must never call the subscriber again.
4. When the stream ends, the subscriber function will be called with
   and `End` event. The return value of the subscribe function is
   ignored in this case.

A `Property` behaves similarly to an `EventStream` except that

1. On a call to `subscribe`, it will deliver its current value
(if any) to the provided subscriber function wrapped into an `Initial`
event.
2. This means that if the Property has previously emitted the value `x`
to its subscribers and that is the latest value emitted, it will deliver
this value to the new subscriber.
3. Property may or may not have a current value to start with. Depends
on how the Property was created.

Atomic updates
--------------

From version 0.4.0, Bacon.js supports atomic updates to properties, with
known limitations.

Assume you have properties A and B and property C = A + B. Assume that
both A and B depend on D, so that when D changes, both A and B will
change too.

When D changes `d1 -> d2`, the value of A `a1 -> a2` and B changes `b1
-> b2` simultaneously, you'd like C to update atomically so that it
would go directly `a1+b1 -> a2+b2`. And, in fact, it does exactly that.
Prior to version 0.4.0, C would have an additional transitional
state like `a1+b1 -> a2+b1 -> a2+b2`

Atomic updates are limited to Properties only, meaning that simultaneous
events in EventStreams will not be recognized as simultaneous and may
cause extra transitional states to Properties. But as long as you're
just combining Properties, you'll updates will be atomic.

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
handling. You can always use `stream.endOnError()` to get a stream
that ends on error!

Examples
========

See [Examples](https://github.com/baconjs/bacon.js/blob/master/examples/examples.html)

See [Specs](https://github.com/baconjs/bacon.js/blob/master/spec/BaconSpec.coffee)

See Worzone [demo](http://juhajasatu.com/worzone/) and [source](http://github.com/raimohanska/worzone)

Install
=======

Bacon uses npm to install the dependencies needed for compiling the coffeescript source and run the test. So first run:

    npm install

Build
=====

Build the coffeescript source into javascript:

    grunt

Result javascript files will be generated in `dist` directory.

Test
====

Run unit tests:

    npm test

Run browser tests:

    npm install
    npm install --save-dev browserify@1.18.0
    npm install -g testem
    testem

Run performance tests:

    coffee performance/*

Dependencies
============

Runtime: jQuery or Zepto.js (optional; just for jQ/Zepto bindings)
Build/test: node.js, npm, coffeescript

Compatibility with other libs
=============================

Bacon.js doesn't mess with prototypes or the global object. Only exceptions below.

* It exports the Bacon object. In a browser, this is added to the window object.
* If jQuery is defined, it adds the asEventStream method to jQuery (similarly to Zepto)

So, it should be pretty much compatible and a nice citizen.

I'm not sure how it works in case some other lib adds stuff to, say, Array prototype, though. Maybe add test for this later?

Compatibility with browsers
===========================

TLDR: good.

Bacon.js is not browser dependent, because it is not a UI library.

I have personally used it Bacon.js with Chrome, Firefox, Safari, IE 6+, iPhone, iPad.

Automatically tested on each commit on modern browsers and IE6+.

The full Bacon.js test suite is run on testling.ci with a wide range of browsers:

[![browser support test report](http://ci.testling.com/baconjs/bacon.js.png)](http://ci.testling.com/baconjs/bacon.js)

Results from those tests are quite unreliable, producing random failures, but the bottom line is that there are no outstanding compatibility issues.

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

Why not RxJs or something else?

- There is no "something else"
- I want my bacon to be open source
- I want good documentation for my bacon
- I think the Observable abstraction is not good enough. It leaves too much room for variations in
behaviour (like hot/cold observables). I feel much more comfortable with EventStream and Property.
- Bacon needs automatic tests. They also serve as documentation.
- I don't like messing with the Array prototype
- Because.

Contribute
==========

Use GitHub issues and Pull Requests.

