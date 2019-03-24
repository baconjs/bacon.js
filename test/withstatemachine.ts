import * as Bacon from "..";

import { expectStreamEvents, expectPropertyEvents, series, fromArray } from "./util/SpecHelper";

describe("EventStream.withStateMachine", function() {
  return describe("runs state machine on the stream", () =>
    expectStreamEvents(
      () => fromArray([1,2,3]).withStateMachine(0, function(sum: number, event: Bacon.Event<number>) {
        if (Bacon.hasValue(event)) {
          return [sum + event.value, []];
        } else if (event.isEnd) {
          return [sum, [new Bacon.Next(sum), event]];
        } else {
          return [sum, [event]];
        }
      }),
      [6])
  );
});

describe("Property.withStateMachine", () =>
  describe("runs state machine on the stream", () =>
    expectPropertyEvents(
      () => series(1, [1,2,3]).toProperty().withStateMachine(0, function(sum, event) {
        if (Bacon.hasValue(event)) {
          return [sum + event.value, []];
        } else if (event.isEnd) {
          return [sum, [new Bacon.Next(sum), event]];
        } else {
          return [sum, [event]];
        }
    }) ,
      [6])
  )
);
