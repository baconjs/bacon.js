Bacon.js
========

A small reactive programming lib for js.

Inspired largely on RxJs, but includes the `EventStream` and `Property`
concepts from [reactive-bacon](https://github.com/raimohanska/reactive-bacon). 
At this stage, comparing bacon.js to RxJs is like comparing a bacon sandwich
to a three-course dinner with Steve Ballmer.

So, where's the bacon?

- [CoffeeScript src](src/Bacon.coffee)
- [Generated js](lib/Bacon.js)
- [Specs](spec/BaconSpec.coffee)

API
===

Creating streams
----------------

`$.asEventStream("click")` creates an EventStream from events on a
jQuery object

`Bacon.sequentially(interval, values)` creates a stream containing given
values (given as array). Delivered with given interval (in milliseconds)

`Bacon.later(delay, value)` creates a single-element stream that
produces given value after given delay (milliseconds).

`Bacon.pushStream()` creates a pushable stream. You can push events by
using the `push` function of the pushable stream. You can only push
Event objects though.

EventStream
-----------

`EventStream` a stream of events. See methods below.

`stream.subscribe(f)` subscribes given side-effect function to
event stream. Function will receive Event objects (see below)

`stream.map(f)` maps values using given function

`stream.filter(f)` filters values using given predicate

`stream.merge(stream2)` merges two streams into on that delivers events
from both

`stream.toProperty(initialValue)` creates a Property based on the
EventStream. You can optionally pass an initial value

Property
--------

`Property` a reactive property. Has the concept of "current value"

`property.subscribe(f)` subscribes side-effeect to property. If there's
a current value, an `Initial` event will be pushed immediately.

Event
-----

`Event` has subclasses `Next`, `End` and `Initial`

`Next` next value in an EventStream of a Property. Call isNext() to
distinguish a Next event from other eventss.

`End` an end-of-stream event of EventStream or Property. Call isEnd() to
distinguish an End from other events.

`Initial` the initial (current) value of a Property. Call isInitial() to
distinguish from other events. Only sent immediately after subscription
to a Property.

`Event.value` the value associated with a Next or Initial event


Examples
========

See examples/examples.html

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

        keyState(32).subscribe(function(state) {
          $("#state").text(state.value)
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

Contribute
==========

Use GitHub issues and Pull Requests.
