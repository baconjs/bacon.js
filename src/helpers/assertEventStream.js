import EventStream from "../classes/EventStream";
import assert from "./assert";

export default function assertEventStream(event) {
  assert("not an EventStream : " + event, !(event instanceof EventStream));
}