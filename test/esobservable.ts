import * as Bacon from "..";
import { expect } from "chai";
import * as Observable from 'zen-observable';

describe("EventStream[Symbol.observable]", function() {
  it("outputs compatible Observable", function(done) {
    const bus = new Bacon.Bus<number>();
    const values:number[] = [];
    const observable = Observable.from(<any>bus);
    observable.subscribe({
      next(x: number) {
        return values.push(x);
      },
      complete() {
        expect(values).to.deep.equal([1, 2, 3]);
        return done();
      }
    });

    bus.push(1);
    bus.push(2);
    bus.push(3);
    return bus.end();
  });

  it("keeps subscription closed updated when stream ends", function() {
    const bus = new Bacon.Bus<number>();
    const observable = <any>Observable.from(<any>bus);
    const subscription = observable.subscribe({
      next: function(x: number) {},
      complete: function() {}
    });

    expect(subscription.closed).to.equal(false);
    bus.end();
    return expect(subscription.closed).to.equal(true);
  });

  it("keeps subscription closed updated when unsubscribing", function() {
    const bus = new Bacon.Bus<number>();
    const observable = Observable.from(<any>bus);
    const subscription = observable.subscribe({
      next(x: number) {},
      complete() {}
    });


    expect(subscription.closed).to.equal(false);
    subscription.unsubscribe();
    return expect(subscription.closed).to.equal(true);
  });

  it("unsubscribes stream after an error", function(done) {
    const bus = new Bacon.Bus<number>();
    const values: number[] = [];
    const observable = (<any>bus).toESObservable();
    observable.subscribe({
      next(x: number) { return values.push(x); }
    });

    bus.push(1);
    bus.error('error');
    bus.push(2);

    expect(values).to.deep.equal([1]);
    return done();
  });

  return it('supports subscribe(onNext, onError, onCompete) format', function() {
    const bus = new Bacon.Bus<number>();
    const values: number[] = [];
    const errors: any[] = [];
    const completes: any[] = [];
    const onValue = (x: number) => values.push(x);
    const onError = (x: any) => errors.push(x);
    const onComplete = (x: any) => completes.push(x);
    const observable = (<any>bus).toESObservable();
    observable.subscribe(onValue, onError, onComplete);
    bus.push(1);
    bus.error(2);
    bus.end();
    expect(values).to.deep.equal([1]);
    expect(errors).to.deep.equal([2]);
    return expect(completes).to.deep.equal([]);
  });
});
