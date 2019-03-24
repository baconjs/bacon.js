import * as Bacon from "..";

import { expectStreamEvents, later, unstable, take, repeatedly } from "./util/SpecHelper";

describe("Bacon.repeat", function() {
  describe("Polls new streams from generator function until empty result", () =>
    expectStreamEvents(
      function() {
        let count = 0;
        return Bacon.repeat(function(iteration) {
          count++;
          if (count <= 3) {
            return later(1, count);
          }
        });
      },
      [1,2,3])
  );
  describe("Works with synchronous streams", () =>
    expectStreamEvents(
      function() {
        let count = 0;
        return Bacon.repeat(function(iteration) {
          count++;
          if (count <= 3) {
            return Bacon.once(count);
          }
        });
      },
      [1,2,3], unstable)
  );
  describe("Provides generator function with index", () =>
    expectStreamEvents(
      () => take(3, Bacon.repeat(x => later(0, x))),
      [0,1,2])
  );
  describe("Works with endless asynchronous generators", () =>
    expectStreamEvents(
      () => take(3, Bacon.repeat(() => later(0, 1))),
      [1,1,1])
  );
  describe("No stackoverflow", () =>
    expectStreamEvents(
      () => take(3000, Bacon.repeat(() => Bacon.once(1))).filter(false),
      [])
  );
  describe("Works with endless asynchronous streams", () =>
    expectStreamEvents(
      () => take(3, Bacon.repeat(() => repeatedly(1, [1]))),
      [1,1,1])
  );
  describe("Works with endless synchronous generators", () =>
    expectStreamEvents(
      () => take(3, Bacon.repeat(() => Bacon.once(1))),
      [1,1,1], unstable)
  );
});
