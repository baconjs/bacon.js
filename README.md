Bacon.js
========

A small (< 20k) reactive programming lib for JavaScript. Written in CoffeeScript.

Inspired largely by RxJs, but includes the `EventStream` and `Property`
concepts from [reactive-bacon](https://github.com/raimohanska/reactive-bacon).

Please note that Bacon.js is in a very early stage and has a very limited feature set as of yet. 
So at this stage, comparing bacon.js to RxJs is like comparing a bacon sandwich to a 
three-course dinner with Steve Ballmer. 

But hey, where's the bacon?

- [CoffeeScript source](https://github.com/raimohanska/bacon.js/blob/master/src/Bacon.coffee)
- [Generated javascript](https://github.com/raimohanska/bacon.js/blob/master/lib/Bacon.js) (see below for building the js yourself)
- [Specs](https://github.com/raimohanska/bacon.js/blob/master/spec/BaconSpec.coffee)
- [Examples](https://github.com/raimohanska/bacon.js/blob/master/examples/examples.html)

You can also check out my entertaining (LOL), interactive, solid-ass [slideshow](http://raimohanska.github.com/bacon.js-slides/).

And remember to give me feedback on the bacon! Let me know if you've
used it. Tell me how it worked for you. What's missing? What's wrong?
Please contribute!

Intro
=====

Bacon.js is a library for functional reactive programming. Or let's say it's a library for
working with events. Anyways, you can wrap an event source, 
say "mouse clicks on an element" into an `EventStream` by saying

    var cliks = $("h1").asEventStream("click")
    
Each EventStream represents a stream of events. It is an Observable object, meaning
that you can listen to events in the stream using, for instance, the `onValue` method 
with a callback. Like this:

    cliks.onValue(function() { alert("you clicked the h1 element") })
    
But you can do neater stuff too. The Bacon of bacon.js is in that you can transform, 
filter and combine these streams in a multitude of ways (see API below). The methods `map`,
`filter`, for example, are similar to same functions in functional list programming
(like underscore.js). So, if you say

    function always(value) { return function() { value } }
    
    var plus = $("#plus").asEventStream("click").map(always(1))
    var minus = $("#minus").asEventStream("click").map(always(-1))
    var both = plus.merge(minus)

.. you'll have a stream that will output the number 1 when the "plus" button is clicked
and another stream outputting -1 when the "minus" button is clicked. The `both` stream will
be a merged stream containing events from both the plus and minus streams. 
    
In addition to EventStreams, bacon.js has a thing called `Property`, that is almost like an
EventStream, but has a "current value". So things that change and have a current state are 
Properties, while things that consist of discrete events are EventStreams. You could think
mouse clicks as an EventStream and mouse position as a Property. You can create a Property from
an EventStream with `scan` or `toProperty` methods. So, let's say

    function add(x, y) { return x + y }
    var counter = both.scan(0, add)
    counter.onValue(function(sum) { $("#sum").text(sum)})


The `counter` property will contain the sum of the values in the `both` stream, so it's practically 
a counter that can be increased and decreased using the plus and minus buttons. The `scan` method 
was used here to calculate the "current sum" of events in the `both` stream, by giving a "seed value"
`0` and an "accumulator function" `add`. The scan method creates a property that starts with the given
seed value and on each event in the source stream applies the accumulator function to the current
property value and the new value from the stream.

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

`property.changes()` creates a stream of changes to the Property (see Property API below)

EventStream
-----------

`Bacon.EventStream` a stream of events. See methods below.

`stream.onValue(f)` subscribes a given handler function to event
stream. Function will be called for each new value in the stream. This
is the simplest way to assign a side-effect to a stream. The difference
to the `subscribe` method is that the actual stream values are
received, instead of Event objects.

`stream.subscribe(f)` subscribes given handler function to
event stream. Function will receive Event objects (see below).
The subscribe() call returns a `unsubscribe` function that you can
call to unsubscribe. You can also unsubscribe by returning
`Bacon.noMore` from the handler function as a reply to an Event.

`stream.map(f)` maps values using given function, returning a new
EventStream

`stream.scan(seed, f)` scans stream with given seed value and
accumulator function, resulting to a Property. For example, you might
use zero as seed and a "plus" function as the accumulator to create
an "integral" property.

`stream.filter(f)` filters values using given predicate function

`stream.takeWhile(f)` takes while given predicate function holds true

`stream.take(n)` takes at most n elements from the stream

`stream.distinctUntilChanged()` drops consecutive equal elements. So,
from [1, 2, 2, 1] you'd get [1, 2, 1]

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

`stream.throttle(delay)` throttles stream by given amount of
milliseconds. This means that event is only emitted after the given
"quiet period".

`stream.bufferWithTime(delay)` buffers stream events with given delay.
The buffer is flushed at most once in the given delay. So, if your input
contains [1,2,3,4,5,6,7], then you might get two events containing [1,2,3,4]
and [5,6,7] respectively, given that the flush occurs between numbers 4 and 5.

`stream.toProperty(initialValue)` creates a Property based on the
EventStream. You can optionally pass an initial value

Property
--------

`Bacon.Property` a reactive property. Has the concept of "current value".
You can create a Property from an EventStream by using either toProperty 
or scan method.

`property.onValue(f)` subscribes a given handler function to the property.
Function will be called for each new value in the stream, as well as for 
the current value (if any) at the time of calling onValue. This
is the simplest way to assign a side-effect to a property. The handler
will get actual property values only, instead of Event objects.

`property.subscribe(f)` subscribes a handler function to property. If there's
a current value, an `Initial` event will be pushed immediately. `Next` 
event will be pushed on updates and an `End` event in case the source 
EventStream ends.

`property.onValue(f)` 

`property.map(f)` maps property values with given function, returing a
new Property

`property.combine(f, property2)` combines the latest values of the two
properties using a two-arg function.

`property.sample(interval)` creates an EventStream by sampling the
property value at given interval (in milliseconds)

`property.sampledBy(stream)` creates an EventStream by sampling the
property value at each event from the given stream

`property.changes()` returns an EventStream of property value changes.
Returns exactly same events as the property itself, except any Initial
events.

Event
-----

`Bacon.Event` has subclasses `Next`, `End` and `Initial`

`Bacon.Next` next value in an EventStream of a Property. Call isNext() to
distinguish a Next event from other events.

`Bacon.End` an end-of-stream event of EventStream or Property. Call isEnd() to
distinguish an End from other events.

`Bacon.Initial` the initial (current) value of a Property. Call isInitial() to
distinguish from other events. Only sent immediately after subscription
to a Property.

Event properties and methods:

`event.value` the value associated with a Next or Initial event

`event.hasValue()` returns true for events of type Initial and Next

`event.isNext()` true for Next events

`event.isInitial()` true for Initial events

`event.isEnd()` true for End events

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
4. A stream must never emit eny other events after End (not even another End)

The rules are deliberately redundant, explaining the constraints from
different perspectives. The contract between an EventStream and its
subscriber is as follows:

1. For each new value, the subscriber function is called. The new
   value is wrapped into a `Next` event.
2. The subscriber unction returns a result which is either `Bacon.noMore` or
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
None of that will happen with bacon.js. Happy frying!

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

Why Bacon?
==========

Why not RxJs or something else?

- There is no "something else"
- I want by bacon to be open-source
- I want good documentation for my bacon
- I think the Observable abstraction is not a good enough. It leaves too much room for variations in 
behaviour (like hot/cold observables). I feel much more comfortable with EventStream and Property.
- Bacon needs automatic tests. They also serve as documentation.
- Because.

Contribute
==========

Use GitHub issues and Pull Requests.

TODO
====

- Try converting Worzone to bacon as a proof-of-concept (in progress)
- Take equality seriosly: how should values be compared in, for
  instance, distinctUntilChanged
- Performance tests (compare with RxJs for example)
- Should property be updated on actually changed values only?
    - More probably a "distict()" method to filter out duplicates
- Improve Property test by also subscribing at each value, ensuring that
  an immediate matching Initial event is sent to the new Subscriber
- Browser tests
- Interactive examples, like in my devday-rx presentation
- API doc with interactive examples
- An animated gif of frying bacon
