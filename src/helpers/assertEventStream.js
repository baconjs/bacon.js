import assert from "./assert";

export default function(event) {
  assert("not an EventStream : " + event, !(event instanceof Bacon.EventStream));
}