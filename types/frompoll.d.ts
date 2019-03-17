import { EventLike } from "./frombinder";
import { EventStream } from "./observable";
/**
 * A polled function used by [fromPoll](../globals.html#frompoll)
 */
export declare type PollFunction<V> = () => EventLike<V>;
/**
 Polls given function with given interval.
 Function should return Events: either [`Bacon.Next`](classes/next.html) or [`Bacon.End`](classes/end.html). Polling occurs only
 when there are subscribers to the stream. Polling ends permanently when
 `f` returns [`Bacon.End`](classes/end.html).
 * @param delay poll interval in milliseconds
 * @param poll function to be polled
 * @typeparam V Type of stream elements
 */
export default function fromPoll<V>(delay: number, poll: PollFunction<V>): EventStream<V>;
