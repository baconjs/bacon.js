import * as Bacon from "..";
import { expectStreamEvents, semiunstable } from "./util/SpecHelper";

import * as Observable from 'zen-observable';
import * as Rx from 'rxjs';

describe("Bacon.fromESObservable", function() {
  describe("turns an ES observable into an EventStream", () =>
    expectStreamEvents(
      () => Bacon.fromESObservable(Observable.of(1, 2)),
      [1, 2], semiunstable)
  );

  describe("ends stream after an error", () =>
    expectStreamEvents(
      function() {
        const observable = new Observable(function(observer) {
          observer.next(1);
          return observer.error("");
        });
        return Bacon.fromESObservable(observable);
      },
      [1, "<error>"], semiunstable)
  );

  return describe("turns an RxJS observable into an EventStream", () =>
    expectStreamEvents(
      () => Bacon.fromESObservable(Rx.Observable.of('hello world')),
      ['hello world'], semiunstable)
  );
});
