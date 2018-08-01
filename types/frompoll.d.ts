import { EventLike } from "./frombinder";
/**
 Polls given function with given interval.
 Function should return Events: either [`Bacon.Next`](classes/next.html) or [`Bacon.End`](classes/end.html). Polling occurs only
 when there are subscribers to the stream. Polling ends permanently when
 `f` returns [`Bacon.End`](classes/end.html).
 * @param poll interval in milliseconds
 * @param poll function
 * @typeparam V Type of stream elements
 */
export default function fromPoll<V>(delay: number, poll: () => EventLike<V>): import("../../../../../Users/juha/code/bacon.js/src/observable").EventStream<V>;
