import * as Bacon from "../..";
import { expect } from "chai";
import { expectStreamEvents, series, semiunstable, error } from "./util/SpecHelper";

describe("EventStream.flatMapEvent", function() {
  describe("should spawn new stream for each event (value or error) and collect results into a single stream", () =>
    expectStreamEvents(
      () => series(1, [1, error()]).flatMapEvent(function(event) {
        if (Bacon.hasValue(event)) {
          return event.value + 1;
        } else if (event.isError) {
          return "error handled";
        }
      }),          
      [2, "error handled"], semiunstable)
  );
  
  it("toString", () => expect(Bacon.never().flatMapEvent(function() {}).toString()).to.equal("Bacon.never().flatMapEvent(function)"));
});
