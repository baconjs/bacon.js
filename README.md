Bacon.js
========

A small functional reactive programming lib for JavaScript.

Turns your event spaghetti into clean and declarative feng shui bacon, by switching
from imperative to functional. It's like replacing nested for-loops with functional programming
concepts like `map` and `filter`. Stop working on individual events and work with event streams instead. 
Transform your data with `map` and `filter`. Combine your data with `merge` and `combine`. 
Then switch to the heavier weapons and wield `flatMap` and `combineTemplate` like a boss.

Here's the stuff.

- [CoffeeScript source](https://github.com/raimohanska/bacon.js/blob/master/src/Bacon.coffee)
- [Generated javascript](https://github.com/raimohanska/bacon.js/blob/master/lib/Bacon.js) (see below for building the js yourself)
- [Generated javascript (minified, no asserts)](https://github.com/raimohanska/bacon.js/blob/master/lib/Bacon.min.js)
- [Specs](https://github.com/raimohanska/bacon.js/blob/master/spec/BaconSpec.coffee)
- [Examples](https://github.com/raimohanska/bacon.js/blob/master/examples/examples.html)
- [Diagrams](https://github.com/raimohanska/bacon.js/wiki) for the visual learners
- [My Blog](http://nullzzz.blogspot.com) with some baconful and reactive postings along with a Bacon.js tutorial

You can also check out my entertaining (LOL), interactive, solid-ass [slideshow](http://raimohanska.github.com/bacon.js-slides/).

And remember to give me feedback on the bacon! Let me know if you've
used it. Tell me how it worked for you. What's missing? What's wrong?
Please contribute!

Install
=======

You can download the latest [generated javascript](https://raw.github.com/raimohanska/bacon.js/master/lib/Bacon.js).

..or you can use script tags to include this file directly from Github:

    <script src="https://raw.github.com/raimohanska/bacon.js/master/lib/Bacon.js"></script>

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

    var cliks = $("h1").asEventStream("click")
    
Each EventStream represents a stream of events. It is an Observable object, meaning
that you can listen to events in the stream using, for instance, the `onValue` method 
with a callback. Like this:

    cliks.onValue(function() { alert("you clicked the h1 element") })
    
But you can do neater stuff too. The Bacon of bacon.js is in that you can transform, 
filter and combine these streams in a multitude of ways (see API below). The methods `map`,
`filter`, for example, are similar to same functions in functional list programming
(like [Underscore](http://documentcloud.github.com/underscore/)). So, if you say

    var plus = $("#plus").asEventStream("click").map(1)
    var minus = $("#minus").asEventStream("click").map(-1)
    var both = plus.merge(minus)

.. you'll have a stream that will output the number 1 when the "plus" button is clicked
and another stream outputting -1 when the "minus" button is clicked. The `both` stream will
be a merged stream containing events from both the plus and minus streams. This allows
you to subscribe to both streams with one handler:

    both.onValue(function(val) { /* val will be 1 or -1 */ })

In addition to EventStreams, bacon.js has a thing called `Property`, that is almost like an
EventStream, but has a "current value". So things that change and have a current state are 
Properties, while things that consist of discrete events are EventStreams. You could think
mouse clicks as an EventStream and mouse position as a Property. You can create Properties from
an EventStream with `scan` or `toProperty` methods. So, let's say

    function add(x, y) { return x + y }
    var counter = both.scan(0, add)
    counter.onValue(function(sum) { $("#sum").text(sum) })

The `counter` property will contain the sum of the values in the `both` stream, so it's practically 
a counter that can be increased and decreased using the plus and minus buttons. The `scan` method 
was used here to calculate the "current sum" of events in the `both` stream, by giving a "seed value"
`0` and an "accumulator function" `add`. The scan method creates a property that starts with the given
seed value and on each event in the source stream applies the accumulator function to the current
property value and the new value from the stream.

Properties can be very conventiently used for assigning values and attributes to DOM elements with JQuery.
Here we assign the value of a property as the text of a span element whenever it changes:

    property.assign($("span"), "text")

Hiding and showing the same span depending on the content of the property value is equally straightforward

    function hiddenForEmptyValue(value) { return value == "" ? "hidden" : "visible" }
    property.map(hiddenForEmptyValue).assign($("span"), "css", "visibility")
    
In the example above a property value of "hello" would be mapped to "visible", which in turn would result in Bacon calling

    $("span).css("visibility", "visible")

For an actual tutorial, please check out my [blog posts](http://nullzzz.blogspot.fi/2012/11/baconjs-tutorial-part-i-hacking-with.html)
    
API
===

Creating streams
----------------

`$.asEventStream("click")` creates an EventStream from events on a
jQuery or Zepto.js object. You can pass optional arguments to add a 
jQuery live selector and/or a function that processes the jQuery 
event and its parameters, if given, like this:
  `$("#my-div").asEventStream("click", ".more-specific-selector")`
  `$("#my-div").asEventStream("click", ".more-specific-selector", function(event, args) { return args[0] })`
  `$("#my-div").asEventStream("click", function(event, args) { return args[0] })`

`Bacon.fromPromise(promise)` creates an EventStream from a Promise object such as JQuery Ajax. This stream will contain a single value or an error, followed immediately by stream end.

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
with given interval in milliseconds. For example, sequentially(10, [1,2,3]) 
would lead to 1,2,3,1,2,3... to be repeated indefinitely.

`Bacon.never()` creates an EventStream that immediately ends.

`Bacon.fromEventTarget(target, event)` creates an EventStream from events
on a DOM EventTarget or Node.JS EventEmitter object.

`Bacon.fromPoll(interval, f)` polls given function with given interval.
Function should return Events: either Next or End.

`Bacon.later(delay, value)` creates a single-element stream that
produces given value after given delay (milliseconds).

`new Bacon.EventStream(subscribe)` creates an event stream with the given 
subscribe function.

`property.changes()` creates a stream of changes to the Property (see Property API below)

`new Bacon.Bus()` creates a pushable/pluggable stream (see Bus section
below)

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
spedifically, feeds the "error" field of the error event to the function
and produces a "Next" event based on the return value. Function
Construction rules apply.

`observable.mapEnd(f)` Adds an extra Next event just before End. The value is created
by calling the given function when the source stream ends. Instead of a
function, a static value can be used. You can even omit the argument if

`observable.filter(f)` filters values using given predicate function. 
Instead of a function, you can use a constant value (true/false) or a
property extractor string (like ".isValuable") instead. Just like with
`map`, indeed.

`stream.filter(property)` filters a stream based on the value of a
property. Event will be included in output iff the property holds `true`
at the time of the event.

`observable.takeWhile(f)` takes while given predicate function holds true

`observable.take(n)` takes at most n elements from the stream

`observable.takeUntil(stream2)` takes elements from source until a Next event 
appears in the other stream. If other stream ends without value, it is
ignored

`observable.skip(n)` skips the first n elements from the stream

`observable.delay(delay)` delays the stream/property by given amount of milliseconds. Does not delay the initial value of a Property.

`observable.throttle(delay)` throttles stream/property by given amount of milliseconds. This means that event is only emitted after the given
"quiet period". Does not affect the initial value of a Property.

`observable.doAction(f)` returns a stream/property where the function f
is executed for each value, before dispatching to subscribers. This is
useful for debugging, but also for stuff like calling the
preventDefault() method for events. In fact, you can
also use a property-extractor string instead of a function, as in
".preventDefault". The old name for
this method is `do` which is temporarily supported for backward
compatibility.

`observable.not()` returns a stream/property that inverts boolean
values

`observable.flatMap(f)` for each element in the source stream, spawn a new
stream using the function `f`. Collect events from each of the spawned
streams into the result stream. This is very similar to selectMany in
RxJs.

stream.flatMap() can be used conveniently with `Bacon.once()` and `Bacon.never()` for converting and filtering at the same time, including only some of the results.

Example - converting strings to integers, skipping empty values:

    stream.flatMap(function(text) {
        return (text != "") ? Bacon.once(parseInt(text)) : Bacon.never()
    })

`observable.flatMapLatest(f)` like flatMap, but instead of including events from
all spawned streams, only includes them from the latest spawned stream.
You can think this as switching from stream to stream. The old name for
this method is `switch` which is temporarily supported for backward
compatibility.

`observable.scan(seed, f)` scans stream/property with given seed value and
accumulator function, resulting to a Property. For example, you might
use zero as seed and a "plus" function as the accumulator to create
an "integral" property. Instead of a function, you can also supply a
method name such as ".concat", in which case this method is called on
the accumulator value and the new stream value is used as argument.

Example:

    var plus = function (a,b) { return a + b }
    Bacon.sequentially(1, [1,2,3]).scan(0, plus)

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

`observable.slidingWindow(n)` returns a Property that represents a
"sliding window" into the history of the values of the Observable. For
example, if you have a stream `s` with value a sequence 1 - 2 - 3 - 4 - 5, the
respective values in `s.slidingWindow(2)` would be [] - [1] - [1,2] -
[2,3] - [3,4] - [4,5].


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
isEqual(oldValue, newValue)

`stream.merge(stream2)` merges two streams into one stream that delivers
events from both

`stream.bufferWithTime(delay)` buffers stream events with given delay.
The buffer is flushed at most once in the given delay. So, if your input
contains [1,2,3,4,5,6,7], then you might get two events containing [1,2,3,4]
and [5,6,7] respectively, given that the flush occurs between numbers 4 and 5.

`stream.bufferWithCount(count)` buffers stream events with given count.
The buffer is flushed when it contains the given number of elements. So, if
you buffer a stream of [1, 2, 3, 4, 5] with count 2, you'll get output
events with values [1, 2], [3, 4] and [5].

`stream.toProperty()` creates a Property based on the
EventStream. Without arguments, you'll get a Property without an initial value.
The Property will get its first actual value from the stream, and after that it'll
always have a current value.

`stream.toProperty(initialValue)` creates a Property based on the
EventStream with the given initial value that will be used as the current value until
the first value comes from the stream.

`stream.decorateWith(name, property)` decorates stream values (must be
objects) with a new property with the given name and a value taken from
the given Property.

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

    myProperty.assign($("#my-button"), "attr", "disabled")

A simpler example would be to toggle the visibility of an element based
on a Property:

    myProperty.assign($("#my-button"), "toggle")

Note that the `assign` method is actually just a synonym for `onValue` and
the function construction rules below apply to both.

`property.combine(property2, f)` combines the latest values of the two
properties using a two-arg function. Similarly to `scan`, you can use a
method name instead, so you could do `a.combine(b, ".concat")` for two
properties with array value.

`property.sample(interval)` creates an EventStream by sampling the
property value at given interval (in milliseconds)

`property.sampledBy(stream)` creates an EventStream by sampling the
property value at each event from the given stream. The result
EventStream will contain the property value at each event in the source
stream.

`property.sampledBy(stream, f)` samples the property on stream events.
The result EventStream values will be formed using the given function
`f(propertyValue, streamValue)`. You can use a method name (such as
".concat") instead of a function too.

`property.skipDuplicates([isEqual])` drops consecutive equal elements. So,
from [1, 2, 2, 1] you'd get [1, 2, 1]. Uses the === operator for equality
checking by default. If the isEqual argument is supplied, checks by calling
isEqual(oldValue, newValue)

`property.changes()` returns an EventStream of property value changes.
Returns exactly the same events as the property itself, except any Initial
events. Note that property.changes() does NOT skip duplicate values, use .skipDuplicates() for that.

`property.and(other)` combines properties with the `&&` operator.

`property.or(other)` combines properties with the `||` operator.

`property.decode(mapping)` decodes input using the given mapping. Is a
bit like a switch-case or the decode function in Oracle SQL. For
example, the following would map the value 1 into the the string "mike" 
and the value 2 into the value of the `who` property.

    property.decode({1 : "mike", 2 : who})

This is actually based on `combineTemplate` so you can compose static
and dynamic data quite freely, as in

    property.decode({1 : { type: "mike" }, 2 : { type: "other", whoThen : who }})

Combining multiple streams and properties
-----------------------------------------

`Bacon.combineAsArray(streams)` combines Properties and EventStreams so 
that the result Property will have an array of all property values as its value.
The input array may contain both Properties and EventStreams. In the
latter case, the stream is first converted into a Property and then
combined with the other properties.

`Bacon.combineAsArray(s1, s2, ...) just like above, but with streams
provided as a list of arguments as opposed to a single array.

`Bacon.mergeAll(streams)` merges given array of EventStreams.

`Bacon.combineAll(streams, f)` combines given list of streams/properties
using the given combinator function `f(s1, s2)`. The function is applied in a
fold-like fashion: the first two streams are given to the function
first. Then the result of this operation is combined with the third
stream and so on. In this variant, the combinator function is applied to
the streams themselves, not the stream values.

`Bacon.combineWith(streams, f)` combines given list of streams/properties
using the given combinator function `f(v1, v2)`. In this variant, the
combinator function is used for combining two stream values, not the
streams themselves. This is equivalent to combining the
streams/properties using the combine method like a.combine(b,
f).combine(c.f) etc. For example, you can combine properties containing
arrays into a single array property, with Bacon.combineWith(properties,
".concat").

`Bacon.combineTemplate(template)` combines streams using a template
object. For instance, assuming you've got streams or properties named
`password`, `username`, `firstname` and `lastname`, you can do

    var loginInfo = Bacon.combineTemplate({
        userid: username, 
        passwd: password, 
        name: { first: firstname, last: lastname }})

.. and your new loginInfo property will combine values from all these
streams using that template, whenever any of the streams/properties 
get a new value. For instance, it could yield a value such as

    { userid: "juha", 
      passwd: "easy", 
      name : { first: "juha", last: "paananen" }}

In addition to combining data from streams, you can include constant
values in your templates.

Note that all Bacon.combine* methods produce a Property instead of an EventStream. If you need the result as an EventStream you might want to use property.changes()

    Bacon.combineWith([stream1,stream2], function(v1,v2) {} ).changes()

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

`stream.map(".dudes.1") would pick the second object from the nested
"dudes" array. For example, you'd get "jack" for `{ dudes : ["john",
"jack"] }`.

`stream.doAction(".preventDefault")` would call the "preventDefault" method of
stream values. The old name for
this method is `do` which is temporarily supported for backward
compatibility.

`stream.filter(".attr", "disabled").not()` would call `.attr("disabled")` on
stream values and filter by the return value. This would practically
inlude only disabled jQuery elements to the result stream.

If none of the above applies, Bacon will return a constant value. For
instance:

`mouseClicks.map({ isMouseClick: true })` would map all events to the
object `{ isMouseClick: true }`

Methods that support function construction include 
at least `onValue`, `onError`, `onEnd`, `map`, `filter`, `assign`, `takeWhile`, `mapError` and `do`.

Latest value of Property or EventStream
---------------------------------------

`Bacon.latestValue(stream)` will return a function that will return the
latest value from the given stream or property. Notice that the
side-effect of this is that there will be an irremovable subscriber for
the stream that takes care of storing the latest value.

This is not really recommended. Usually you'll do better by using
combinators such as `combine`, `sampledBy` and `combineTemplate`.

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

`event.value` the value associated with a Next or Initial event

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
`Bacon.More`. The `undefined` value is handled like `Bacon.more`.
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

See [Examples](https://github.com/raimohanska/bacon.js/blob/master/examples/examples.html)

See [Specs](https://github.com/raimohanska/bacon.js/blob/master/spec/BaconSpec.coffee)

See Worzone [demo](http://juhajasatu.com/worzone/) and [source](http://github.com/raimohanska/worzone)

Build
=====

Build the coffeescript source into javascript:

    cake build

Result javascript file will be generated in `lib` directory.

Test
====

Run unit tests:

    npm install&&npm test

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

Bacon.js is not browser dependent, because it is not a UI library. Hence there are not actual browser tests and no
"official" list of supported browsers.

I have used Bacon.js with Chrome, Firefox, Safari, IE 8+, iPhone, iPad.

Node.js
=======

Sure. Works. Try it out.

    npm install baconjs

Then type `node` and try the following

    Bacon = require("baconjs").bacon()
    Bacon.sequentially(1000, ["B", "A", "C", "O", "N"]).log()

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
