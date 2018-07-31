import { EventLike } from "./frombinder";
export default function fromPoll<V>(delay: number, poll: () => EventLike<V>): import("../../../../../Users/juha/code/bacon.js/src/observable").EventStream<V>;
