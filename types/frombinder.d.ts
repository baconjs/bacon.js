import { Event } from './event';
import { EventStream } from "./observable";
import { Unsub } from "./types";
import { Reply } from "./reply";
export declare type FlexibleSink<V> = (event: EventLike<V>) => Reply;
export declare type EventLike<V> = V | Event<V> | Event<V>[];
/**
Binder function used in [fromBinder](../globals.html#frombinder)
@typeparam V Type of stream elements
 */
export declare type Binder<V> = (sink: FlexibleSink<V>) => Unsub;
export declare type EventTransformer<V> = (...args: any[]) => EventLike<V>;
/**
 If none of the other factory methods above apply, you may of course roll your own EventStream by using `fromBinder`.

 <a name="bacon-frombinder"></a>
 [`Bacon.fromBinder(subscribe)`](#bacon-frombinder "Bacon.fromBinder(subscribe)") The parameter `subscribe` is a function that accepts a `sink` which is a function that your `subscribe` function can "push" events to.

 For example:

 ```js
 var stream = Bacon.fromBinder(function(sink) {
  sink("first value")
  sink([new Bacon.Next("2nd"), new Bacon.Next("3rd")])
  sink(new Bacon.Error("oops, an error"))
  sink(new Bacon.End())
  return function() {
     // unsub functionality here, this one's a no-op
  }
})
 stream.log()
 ```

 As shown in the example, you can push

 - A plain value, like `"first value"`
 - An [`Event`](#event) object including [`Bacon.Error`](#bacon-error) (wraps an error) and [`Bacon.End`](#bacon-end) (indicates
 stream end).
 - An array of [event](#event) objects at once

 Other examples can be found on [JSFiddle](http://jsfiddle.net/PG4c4/) and the
 [Bacon.js blog](http://baconjs.blogspot.fi/2013/12/wrapping-things-in-bacon.html).

 The `subscribe` function must return a function. Let's call that function
 `unsubscribe`. The returned function can be used by the subscriber (directly or indirectly) to
 unsubscribe from the EventStream. It should release all resources that the subscribe function reserved.

 The `sink` function may return [`Bacon.noMore`](#bacon-nomore) (as well as [`Bacon.more`](#bacon-more)
 or any other value). If it returns [`Bacon.noMore`](#bacon-nomore), no further events will be consumed
 by the subscriber. The `subscribe` function may choose to clean up all resources at this point (e.g.,
 by calling `unsubscribe`). This is usually not necessary, because further calls to `sink` are ignored,
 but doing so can increase performance in [rare cases](https://github.com/baconjs/bacon.js/issues/484).

 The EventStream will wrap your `subscribe` function so that it will
 only be called when the first stream listener is added, and the `unsubscribe`
 function is called only after the last listener has been removed.
 The subscribe-unsubscribe cycle may of course be repeated indefinitely,
 so prepare for multiple calls to the subscribe function.


 @param  binder
 @param  eventTransformer
 @typeparam V Type of stream elements

 */
export default function fromBinder<V>(binder: Binder<V>, eventTransformer?: EventTransformer<V>): EventStream<V>;
