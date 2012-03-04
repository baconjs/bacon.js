Bacon.js
========

A small (< 14k) reactive programming lib for js.

Inspired largely by RxJs, but includes the `EventStream` and `Property`
concepts from [reactive-bacon](https://github.com/raimohanska/reactive-bacon).

Please note that Bacon.js is in a very early stage and has a very limited feature set as of yet. 
So at this stage, comparing bacon.js to RxJs is like comparing a bacon sandwich to a 
three-course dinner with Steve Ballmer. 

But hey, where's the bacon?

- [CoffeeScript src](https://github.com/raimohanska/bacon.js/blob/master/src/Bacon.coffee)
- [Generated js](https://github.com/raimohanska/bacon.js/blob/master/lib/Bacon.js)
- [Specs](https://github.com/raimohanska/bacon.js/blob/master/spec/BaconSpec.coffee)
- [Examples](https://github.com/raimohanska/bacon.js/blob/master/examples/examples.html)

API
===

Creating streams
----------------

`$.asEventStream("click")` creates an EventStream from events on a
jQuery or Zepto.js object

`Bacon.interval(interval, value)` repeats the single element
indefinitely with the given interval (in milliseconds)

`Bacon.sequentially(interval, values)` creates a stream containing given
values (given as array). Delivered with given interval (in milliseconds)

`Bacon.repeatedly(interval, values)` repeats given elements indefinitely
with given interval (in millis)

`Bacon.fromPoll(interval, f)` polls given function with given interval.
Function should return Events: either Next or End.

`Bacon.later(delay, value)` creates a single-element stream that
produces given value after given delay (milliseconds).

`Bacon.pushStream()` creates a pushable stream. You can push values by
using the `push` function of the pushable stream. You can send the End event by calling `end`

`new Bacon.EventStream(subscribe)` creates an event stream with the given 
subscribe function.

EventStream
-----------

`Bacon.EventStream` a stream of events. See methods below.

`stream.onValue(f)` subscribes a given callback function to event
stream. Function will be called for each new value in the stream. This
is the simplest way to assign a side-effect to a stream.

`stream.subscribe(f)` subscribes given handler function to
event stream. Function will receive Event objects (see below).
The subscribe() call returns a `unsubscribe` function that you can
call to unsubscribe. You can also unsubscribe by returning
`Bacon.noMore` from the handler function as a reply to an Event.

`stream.map(f)` maps values using given function, returning a new
EventStream

`stream.filter(f)` filters values using given predicate function

`stream.takeWhile(f)` takes while given predicate function holds true

`stream.take(n)` takes at most n elements from the stream

`stream.merge(stream2)` merges two streams into on that delivers events
from both

`stream.flatMap(f)` for each element in the source stream, spawn a new
stream using the function `f`. Collect events from each of the spawned
streams into the result stream. This is very similar to selectMany in
RxJs

`stream.switch(f)` like flatMap, but instead of including events from
all spawned streams, only includes them from the latest spawned stream.
You can think this as switching from stream to stream

`stream.takeUntil(stream2)` takes elements from source until a Next event 
appears in the other stream. If other stream ends without value, it is
ignored

`stream.delay(delay)` delays the stream by given amount of milliseconds

`stream.toProperty(initialValue)` creates a Property based on the
EventStream. You can optionally pass an initial value

Property
--------

`Bacon.Property` a reactive property. Has the concept of "current value"

`property.subscribe(f)` subscribes side-effeect to property. If there's
a current value, an `Initial` event will be pushed immediately.

`property.map(f)` maps property values with given function, returing a
new Property

`property.combine(f, property2)` combines the latest values of the two
properties using a two-arg function.

`property.changes()` returns an EventStream of property value changes.
Returns exactly same events as the property itself, except any Initial
events.

Event
-----

`Bacon.Event` has subclasses `Next`, `End` and `Initial`

`Bacon.Next` next value in an EventStream of a Property. Call isNext() to
distinguish a Next event from other eventss.

`Bacon.End` an end-of-stream event of EventStream or Property. Call isEnd() to
distinguish an End from other events.

`Bacon.Initial` the initial (current) value of a Property. Call isInitial() to
distinguish from other events. Only sent immediately after subscription
to a Property.

`Event.value` the value associated with a Next or Initial event

Cleaning up the frying pan
--------------------------

As described above, a subscriber can signal the loss of interest in new events 
in any of these two ways:

1. Return `Bacon.noMore` from the handler function
2. Call the `dispose()` function that was returned by the `subscribe()`
   call.

Based on my experience on RxJs coding, an actual side-effect subscriber
in application-code never does this. So the business of unsubscribing is
mostly internal business and you can ignore it unless you're working on
a custom stream implementation or a stream combinator. In that case, I
welcome you to contribute your stuff to the frying pan here.

Examples
========

See [Examples](https://github.com/raimohanska/bacon.js/blob/master/examples/examples.html)

~~~ coffeescript
        $("#clikme").asEventStream("click").subscribe(function(event) {
          alert("mmmm... bacon!")
        })

        function always(value) { return function() { return value }}
        
        function keyCodeIs(keyCode) { 
          return function(event) { return event.keyCode == keyCode }
        }

        function keyDowns(keyCode) { 
          return $(document).asEventStream("keydown").filter(keyCodeIs(keyCode))
        }

        function keyUps(keyCode) { 
          return $(document).asEventStream("keyup").filter(keyCodeIs(keyCode))
        }

        function keyState(keyCode) { 
          return keyDowns(keyCode).map(always("DOWN"))
            .merge(keyUps(keyCode).map(always("UP"))).toProperty("UP")
        }

        keyState(32).onValue(function(state) {
          $("#state").text(state)
        })
~~~

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
Build/test: node.js, npm, cake

Contribute
==========

Use GitHub issues and Pull Requests.

TODO
====

- Browser tests
- Interactive examples, like in my devday-rx presentation
- API doc with interactive examples
- An animated gif of frying bacon
- More combinators
    - combineLatest
    - scan
- Property combinators
    - scan
    - sampledBy
