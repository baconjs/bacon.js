import withStateMachine from "./withstatemachine";
import { none, Option, Some, isNone } from "./optional";
import { Desc } from "./describe";
import Observable from "./observable";
import Event, { hasValue } from "./event"

export interface Equals<A> {
  (left: A, right: A): boolean
}

/** @hidden */
export function equals<A>(a: A, b: A) { return a === b; }

/** @hidden */
export default function skipDuplicates<A>(src: Observable<A>, isEqual: Equals<A> = equals): Observable<A> {
  let desc = new Desc(src, "skipDuplicates", []);
  return withStateMachine<A, Option<A>, A>(none(), function (prev: Option<A>, event: Event<A>): [Option<A>, Event<A>[]] {
    if (!hasValue(event)) {
      return [prev, [event]];
    } else if (event.isInitial || isNone(prev) || !isEqual(prev.get(), <A>event.value)) {
      return [new Some(<any>event.value), [event]];
    } else {
      return [prev, []];
    }
  }, src).withDesc(desc)
}
