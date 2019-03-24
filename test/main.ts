import * as Bacon from "..";
import { expect } from "chai";

import { expectStreamEvents, expectPropertyEvents, series, semiunstable, unstable, repeatedly, fromArray, later, once, t, activate, deferred } from "./util/SpecHelper";

function latter<A> (a: A, b: A) { return b }
const concat = (x: string, y: string) => x + y
type Faq = {faq: string}

describe("Integration tests", function() {
  describe("Property.sampleBy", function() {
    describe("uses updated property after combine", function() {
      return expectPropertyEvents(
        function() {
          const src = series(2, ["b", "c"]).toProperty("a");
          const combined = Bacon.constant("").combine(src, latter);
          return (<any>src).sampledBy(combined, concat);
        },
        ["aa", "bb", "cc"]);
    });
    return describe("With circular Bus setup", () =>
      it("Just works (bug fix)", function() {
        const values: boolean[] = [];
        const clicks = new Bacon.Bus<boolean>();
        const toggleBus = new Bacon.Bus<boolean>();

        const shown = toggleBus.toProperty(false);
        shown.changes().onValue(show => { values.push(show) });
        const toggleClicks = shown.sampledBy(clicks).map(shown => !shown);

        toggleBus.plug(toggleClicks);

        clicks.push(true);
        return expect(values).to.deep.equal([true]);
      })
    );
  });
  describe("uses updated property after combine with subscriber", function() {
    return expectPropertyEvents(
      function() {
        const src = series(2, ["b", "c"]).toProperty("a");
        const combined = Bacon.constant("").combine(src, latter);
        combined.onValue();
        return (<any>src).sampledBy(combined, concat);
      },
      ["aa", "bb", "cc"]);
  });
  describe("Property.skipDuplicates", () =>
    describe("Doesn't skip initial value (bug fix #211)", function() {
      const b = new Bacon.Bus();
      const p = b.toProperty();
      p.onValue(function() {}); // force property update
      const s = p.skipDuplicates();
      b.push('foo');

      describe("series 1", () => expectPropertyEvents((() => s.take(1)), ["foo"]));
      describe("series 2", () => expectPropertyEvents((() => s.take(1)), ["foo"]));
      return describe("series 3", () => expectPropertyEvents((() => s.take(1)), ["foo"]));
    })
  );
  describe("EventStream.skipDuplicates", () =>
    it("Drops duplicates with subscribers with non-overlapping subscription time (#211)", function() {
      const b = new Bacon.Bus<number>();
      const noDups = b.skipDuplicates();
      const round = function(expected: number[]) {
        const values: number[] = [];
        noDups.take(1).onValue(x => { values.push(x) });
        b.push(1);
        return expect(values).to.deep.equal(expected);
      };
      round([1]);
      round([]);
      return round([]);
    })
  );
  describe("EventStream.concat", () =>
    describe("Works with synchronized left stream and doAction", () =>
      expectStreamEvents(
        function() {
          const bus = new Bacon.Bus();
          const stream = fromArray([1,2]).flatMapLatest(x => Bacon.once(x).concat(later(10, x).doAction(function(x) { bus.push(x); return bus.end(); })));
          stream.onValue(function() {});
          return bus;
        },
        [2])
    )
  );
  describe("EventStream.flatMap", () =>
    describe("works with a complex setup (fix #363)", function() {
      it("case 1 (samplee has no subscribers)", function() {
        let result: Faq|undefined = undefined;
        const prop: Bacon.Property<Faq> = Bacon.combineTemplate({faq: later(1).toProperty("default value")});
        Bacon.once(0).flatMap(function(_) {
            const problem = prop.sampledBy(Bacon.once(0));
            return problem.onValue(x => { result = x });
        }).onValue(function() {});
        return deferred(() => expect(result).to.deep.equal({faq: "default value"}));
      });
      it("case 2 (samplee has subscriber)", function() {
        let result: Faq|undefined = undefined;
        const prop: Bacon.Property<Faq> = Bacon.combineTemplate({faq: later(1).toProperty("default value")});
        prop.onValue(function() {});
        Bacon.once(0).flatMap(function(_) {
            const problem = prop.sampledBy(Bacon.once(0));
            return problem.onValue(x => { result = x });
        }).onValue(function() {});
        return deferred(() => expect(result).to.deep.equal({faq: "default value"}));
      });
      return it("case 3 (original fiddle)", function() {
        let result: Faq|undefined = undefined;
        const input = new Bacon.Bus();
        const prop: Bacon.Property<Faq> = Bacon.combineTemplate({faq: input.toProperty("default value")});
        const events = new Bacon.Bus<number>();
        events.flatMapLatest(function(_) {
            const problem = prop.sampledBy(Bacon.once(0));
            return problem.onValue(x => { result = x });
        }).onValue(function() {});
        events.push(0);
        return deferred(() => expect(result).to.deep.equal({faq: "default value"}));
      });
    })
  );
  describe("Property.flatMap", () =>
    describe("works in a complex scenario #338", () =>
      expectStreamEvents(
        function() {
          const a = activate(series(2, ["a", "A"]));
          const b = activate(series(2, ["b", "B"])).delay(1).toProperty();
          return a.flatMapLatest(a => b.map(b => a + b));
        },
        ["ab", "Ab", "AB"], semiunstable)
    )
  );

  describe("Property.flatMapLatest", () =>
    describe("works in combination with synchronous sources in a complex scenario #699", () =>
      expectPropertyEvents(
        function() {
          const bar = Bacon.once('first').merge(Bacon.later(10, 'success')).toProperty();

          return Bacon.constant(false).flatMapLatest(it => Bacon.constant(false).flatMapLatest(it => bar).toProperty());
        },
        ['first', 'success'],
        unstable
      )
    )
  );

  describe("EventStream.flatMapLatest", function() {
    describe("No glitches in a complex scenario", () =>
      expectPropertyEvents(
        function() {
          const changes = series(1, [{a:0,b:0},{a:1,b:10}]);

          const a = changes.map(x => x.a);
          const b = changes.map(x => x.b);

          const ab = Bacon.combineAsArray(a, b);

          const f = ab.flatMapLatest(values => Bacon.once(`f${values}`));

          return Bacon.combineAsArray(f, b.map(x => x.toString())).map(x => x[0]);
        },
        ["f0,0","f1,10"], semiunstable)
    );
    return it("Works with flatMap source spawning fromArrays", function() {
      const result: number[] = [];
      const array = [1,2,3];
      fromArray(array)
        .map(_ => array)
        .flatMap(fromArray)
        .flatMapLatest(Bacon._.id)
        .onValue(v => { result.push(<any>v) });
      return deferred(() => expect(result).to.deep.equal([1,2,3,1,2,3,1,2,3]));
    });
  });
  describe("Mixed test from two tests above", () =>
    it("works", function() {
      let result : Faq|undefined = undefined;
      const prop: Bacon.Property<Faq> = Bacon.combineTemplate({faq: later(1).toProperty("default value")});
      Bacon.once(0).flatMap(function(_) {
          const problem = prop.sampledBy(Bacon.once(0));
          return problem.onValue(x => { result = x });
      }).onValue(function() {});
      const result2: any[] = [];
      const array = [1,2,3];
      fromArray(array)
        .map(() => array)
        .flatMap(fromArray)
        .flatMapLatest(Bacon._.id)
        .onValue(v => { result2.push(v) });
      return deferred(function() { 
        expect(result).to.deep.equal({faq: "default value"});
        return expect(result2).to.deep.equal([1,2,3,1,2,3,1,2,3]);
      });
    })
  );
  describe("EventStream.debounce", () =>
    describe("works in combination with scan", function() {
      let count = 0;
      return expectPropertyEvents(
        () => series(2, [1,2,3]).debounce(1).scan(0, function(x,y) { count++; return x + y; }),
        [0, 1, 3, 6],
        {extraCheck() { return it("calls function once per value", () => expect(count).to.equal(3)); }}
      );
    })
  );
  describe("Property.debounce", () =>
    it("works with Bacon.combine (bug fix)", function() {
      const values: boolean[][] = [];
      const p1 = Bacon.once(true).toProperty();
      const p2 = Bacon.once(true).toProperty();
      const visibleP = Bacon.combineAsArray([p1, p2]).startWith([]);
      return visibleP.debounce(500).onValue(val => { values.push(val) });
    })
  );
  describe("Property.startWith", () =>
    it("works with combineAsArray", function() {
      let result = null;
      const a = Bacon.constant("lolbal");
      result = Bacon.combineAsArray([a.map(true), a.map(true)]).map("right").startWith("wrong");
      result.onValue(x => { result = x });
      return expect(result).to.equal("right");
    })
  );
  describe("EventStream", function() {
    describe("works with functions as values (bug fix)", function() {
      function hello() { return "hello" }
      describe("case 1", () =>
        expectStreamEvents(
          () => Bacon.once(hello).map(f => f()),
          ["hello"])
      );
      describe("case 2", () =>
        expectStreamEvents(
          () => Bacon.once(hello).flatMap(x => Bacon.once(x)).map(f => f()),
          ["hello"])
      );
      describe("case 3", () =>
        expectPropertyEvents(
          () => Bacon.constant(hello).map(f => f()),
          ["hello"])
      );
      return describe("case 4", () =>
        expectPropertyEvents(
          () => Bacon.constant(hello).flatMap(x => Bacon.once(x)).map(f => f()),
          ["hello"])
      );
    });
    it("handles one subscriber added twice just like two separate subscribers (case Bacon.noMore)", function() {
      const values: string[] = [];
      const bus = new Bacon.Bus<string>();
      const f = function(v: Bacon.Event<string>) {
        if (Bacon.hasValue(v)) {
          values.push(v.value);
          return Bacon.noMore;
        }
      };
      bus.subscribe(f);
      bus.subscribe(f);
      bus.push("bacon");
      expect(values).to.deep.equal(["bacon", "bacon"]);
    });
    return it("handles one subscriber added twice just like two separate subscribers (case unsub)", function() {
      const values: string[] = [];
      const bus = new Bacon.Bus<string>();
      const f = function(v: Bacon.Event<string>) {
        if (Bacon.hasValue(v)) {
          values.push(v.value);
        }
      };
      bus.subscribe(f);
      const unsub = bus.subscribe(f);
      unsub();
      bus.push("bacon");
      expect(values).to.deep.equal(["bacon"]);
    });
  });
  describe("Observable.subscribe and onValue", function() {
    it("returns a dispose() for unsubscribing", function() {
      const s = new Bacon.Bus<string>();
      const values: string[] = [];
      const dispose = s.onValue(value => { values.push(value) });
      s.push("lol");
      dispose();
      s.push("wut");
      expect(values).to.deep.equal(["lol"]);
    });
    it("respects returned Bacon.noMore return value (#523)", function() {
      let calls = 0;
      once(1).merge(Bacon.interval(100, 2)).subscribe(function(event) {
        calls++;
        return Bacon.noMore;
      });

      deferred(() => expect(calls).to.equal(1));
    });
  });
      // will hang if the underlying interval-stream isn't disposed correctly

  describe("Exceptions", () =>
    it("are thrown through the stack", function() {
      const b = new Bacon.Bus<string>();
      b.take(1).flatMap(function(_) { throw "testing testing"; }).onValue(function(_) {});
      expect(() => b.push("")).to.throw("testing testing");
      const values: string[] = [];
      b.take(1).onValue(x => { values.push(x) });
      b.push("after exception");
      expect(values).to.deep.equal(["after exception"]);
    })
  );


  describe("Property update is atomic", function() {
    describe("in a diamond-shaped combine() network", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]).toProperty();
           const b = a.map(x => x);
           const c = a.map(x => x);
           return b.combine(c, (x, y) => x + y);
         },
        [2, 4])
    );
    describe("in a triangle-shaped combine() network", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]).toProperty();
           const b = a.map(x => x);
           return a.combine(b, (x, y) => x + y);
         },
        [2, 4])
    );
    describe("in a double-diamond shaped combine() network", () =>
      expectPropertyEvents(
        function() {
          const a = series(1, [1,2]);
          const b = a.map(x => `b${x}`);
          const c = a.map(x => `c${x}`);
          const d = Bacon.combineAsArray(b,c);
          return Bacon.combineAsArray(a, <any>d);
        },
        [[1, ["b1", "c1"]], [2, ["b2", "c2"]]])
    );

    describe("when filter is involved", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]).toProperty();
           const b = a.map(x => x).filter(() => true);
           return a.combine(b, (x, y) => x + y);
         },
        [2, 4])
    );
    describe("when flatMap is involved (spawning synchronous streams)", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]).toProperty();
           const b = a.flatMap(x => Bacon.once(x));
           return a.combine(b, (x, y) => x + y);
         },
        [2, 4], unstable)
    );
    describe("when root property is based on combine*", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]).toProperty().combine(Bacon.constant(0), (x, y) => x);
           const b = a.map(x => x);
           const c = a.map(x => x);
           return b.combine(c, (x, y) => x + y);
         },
        [2, 4])
    );
    describe("when root is not a Property", () =>
      expectPropertyEvents(
        function() {
           const a = series(1, [1, 2]);
           const b = a.map(x => x);
           const c = a.map(x => x);
           return b.combine(c, (x, y) => x + y);
         },
        [2, 4])
    );
    it("calls combinator function for valid combos only", function() {
      let calls = 0;
      const results: number[] = [];
      const combinator = function(x: number,y: number) {
        calls++;
        return x+y;
      };
      const src = new Bacon.Bus<number>();
      const prop = src.toProperty();
      const out = prop.map(Bacon._.id)
        .combine(prop.map((x: number) => x * 2), combinator)
        .doAction(function() {})
        .combine(prop, (x,y) => x);
      out.onValue(x => { results.push(x) });
      src.push(1);
      src.push(2);
      expect(results).to.deep.equal([3,6]);
      expect(calls).to.equal(2);
    });
    describe("yet respects subscriber return values (bug fix)", () =>
      expectStreamEvents(
        () => repeatedly(t(1), [1, 2, 3]).toProperty().changes().take(1),
        [1])
    );
  });

  describe("When an Event triggers another one in the same stream, while dispatching", function() {
    it("Delivers triggered events correctly", function() {
      const bus = new Bacon.Bus<string>();
      const values: string[] = [];
      bus.take(2).onValue(function(v) {
        bus.push("A");
        return bus.push("B");
      });
      bus.onValue(v => { values.push(v) });
      bus.push("a");
      bus.push("b");
      expect(values).to.deep.equal(["a", "A", "B", "A", "B", "b"]);
    });
      // original version: (["a", "A", "B", "A", "B", "b"])
      // current output: ABABab
    it("keeps bus order", function() {
      const bus = new Bacon.Bus<string>();
      const values: string[] = [];
      bus.take(1).onValue(function(v) {
        bus.push("x");
        values.push(v);
      });
      bus.onValue(v => { values.push(v) });
      bus.push("A");
      expect(values).to.deep.equal(["A", "A", "x"]);
    });
    describe("keeps order when output-queued thing is not from a bus", () =>
      expectStreamEvents(
        function() {
          const bus = new Bacon.Bus<string>();
          const src = Bacon.later(1, "1");
          const result = src.merge(bus);
          let started = false;
          result.onValue(function(val) {
            if (started) {
              throw new Error("next started before previous finished");
            }
            started = true;
            if (val === "1") { bus.push("x"); }
            bus.end();
            started = false;
          });
          return result;
        },
        ["1", "x"], unstable)
    );
    it("EventStream.take(1) works correctly (bug fix)", function() {
      const bus = new Bacon.Bus<string>();
      const values: string[] = [];
      bus.take(1).onValue(function(v) {
        bus.push("onValue triggers a side-effect here");
        values.push(v);
      });
      bus.push("foo");
      expect(values).to.deep.equal(["foo"]);
    });
    it("complex scenario (fix #470)", function() {
      const values: any[] = [];
      const bus1 = new Bacon.Bus<string>();
      const bus2 = new Bacon.Bus<boolean>();
      const p1 = bus1.toProperty("p1");
      const p2 = bus2.toProperty(true);
      p2.filter(Bacon._.id).changes().onValue(_ => { bus1.push("empty") });
      Bacon.combineAsArray(p1, <any>p2).onValue(val => { values.push(val) });

      bus2.push(false);
      bus2.push(true);
      return expect(values).to.deep.equal([
        ["p1", true],
        ["p1", false],
        ["p1", true],
        ["empty", true]]);
    });
  });

  describe("observables created while dispatching", function() {
    const verifyWhileDispatching = function(name: string, f: any, expected: any) {
      it(name + " (independent)", function() {
        const values: any[] = [];
        Bacon.once(1).onValue(function() {
          f().onValue((value: any) => { values.push(value) });
          return deferred(() => expect(values).to.deep.equal(expected));
        });
        return deferred(() => expect(values).to.deep.equal(expected));
      });
      return it(name + " (dependent)", function() {
        const values: any[] = [];
        const src = Bacon.combineAsArray(Bacon.once(1).toProperty(), Bacon.constant(2));
        src.onValue(function() {
          src.flatMap(f()).onValue(value => { values.push(value) });
          return deferred(() => expect(values).to.deep.equal(expected));
        });
        return deferred(() => expect(values).to.deep.equal(expected));
      });
    };

    verifyWhileDispatching("with stream.startWith", 
      (() => later(1, 1).startWith(0)), 
      [0, 1]);
    verifyWhileDispatching("with combineAsArray", 
      (() => Bacon.combineAsArray([Bacon.constant(1)])),
      [[1]]);
    verifyWhileDispatching("with combineAsArray.startWith",
        (function() {
          const a = Bacon.constant("lolbal");
          return Bacon.combineAsArray([a, a]).map("right").startWith("wrong");}),
        ["right"]);
    verifyWhileDispatching("with combineAsArray.changes.startWith",
      (function() {
        const a = Bacon.constant("lolbal");
        return Bacon.combineAsArray([a, a]).changes().startWith(<any>"right");}),
      ["right"]);
    verifyWhileDispatching("with flatMap", (function() {
        const a = Bacon.constant("lolbal");
        return a.flatMap(x => Bacon.once(x));}), ["lolbal"]);
    verifyWhileDispatching("with awaiting", (function() {
        const a = Bacon.constant(1);
        return a.awaiting(a.map(function() {}));}), [false]);
    verifyWhileDispatching("with concat", (function() {
        return Bacon.once(1).concat(Bacon.once(2));}), [1,2]);
    verifyWhileDispatching("with Property.delay", (function() {
        const c = Bacon.constant(1);
        return Bacon.combineAsArray([c, c]).delay(1).map(x => x[0]);
      }), [1]);
  });

  return describe("when subscribing while dispatching", function() {
    describe("single subscriber", function() {
      describe("up-to-date values are used (skipped bounce)", () =>
        expectStreamEvents(
          function() {
            const src = series(1, [1,2]);
            const trigger = src.map(x => x);
            trigger.onValue(function() {});
            const value = src.toProperty();
            value.onValue(function() {});
            return trigger.flatMap(() => value.take(1));
          },
          [1,2])
      );
      return describe("delayed bounce", () =>
        expectStreamEvents(
          function() {
            const src = series(1, [1,2]);
            const trigger = src.map(x => x);
            trigger.onValue(function() {});
            const value = src.filter(x => x === 1).toProperty(0);
            value.onValue(function() {});
            return trigger.flatMap(() => value.take(1));
          },
          [0, 1])
      );
    });
    describe("multiple subscribers", function() {
      describe("up-to-date values are used (skipped bounce)", () =>
        expectStreamEvents(
          function() {
            const src = series(1, [1,2]);
            const trigger = src.map(x => x);
            trigger.onValue(function() {});
            const value = src.toProperty();
            value.onValue(function() {});
            return trigger.flatMap(function() {
              value.onValue(function() {});
              return value.take(1);
            });
          },
          [1,2])
      );
      return describe("delayed bounce", () =>
        expectStreamEvents(
          function() {
            const src = series(1, [1,2]);
            const trigger = src.map(x => x);
            trigger.onValue(function() {});
            const value = src.filter(x => x === 1).toProperty(0);
            value.onValue(function() {});
            return trigger.flatMap(function() {
              value.onValue(function() {});
              return value.take(1);
            });
          },
          [0, 1])
      );
    });
    describe("delayed bounce in case Property ended (bug fix)", () =>
      expectStreamEvents(
        function() {
          const bus = new Bacon.Bus<number>();
          const root = Bacon.once(0).toProperty();
          root.onValue();
          later(1).onValue(_ => {
            root.map(_ => 1).subscribe(function(event) {
              if (Bacon.isEnd(event)) {
                bus.end();
              }
              if (Bacon.hasValue(event)) {
                bus.push(event.value);
              }
            })
          });
          return bus;
        },
        [1])
    );
    describe("poking for errors 2", () =>
      expectStreamEvents(
        function() {
          const bus = new Bacon.Bus();
          const root = series(1, [1,2]).toProperty();
          root.subscribe(function(event) {});
          const outdatedChild = root.filter(x => x === 1).map(x => x);
          outdatedChild.onValue(function() {}); // sets value but will be outdated at value 2

          later(3).onValue(() => {
            outdatedChild.subscribe(function(event) {
              if (Bacon.isEnd(event)) {
                bus.end();
              } 
              if (Bacon.hasValue(event)) {
                bus.push(event.value);
              }
            })
          });

          return bus;
        },
        [1]
      )
    );
    describe("Complex setup by niklas", () =>
      expectPropertyEvents(
        () =>
          Bacon.constant(1).flatMapLatest(e =>
            Bacon.combineAsArray(
                Bacon.combineAsArray(
                    Bacon.constant("middle"),
                    <any>Bacon.combineAsArray(
                        Bacon.combineAsArray(
                            Bacon.constant("innest")
                        )
                    )
                ),
                <any>Bacon.constant("outest")
            )
          )
        ,
        [[["middle", [["innest"]]], "outest"]])
    );
    describe("Calling Bus.end() in onValue", () =>
      it("works correctly in combination with takeUntil (#517)", function(done) {
        const values: number[] = [];
        const bus = new Bacon.Bus<undefined>();
        const s = once(1).merge(Bacon.later(10, 2));
        const ends = bus.mapEnd(undefined);
        s.takeUntil(ends).onValue(function(value) {
          values.push(value);
          bus.end();
        });
        const verify = function() {
          expect(values).to.deep.equal([1]);
          done();
        };
        return Bacon.getScheduler().setTimeout(verify, 20);
      })
    );
  });
});
