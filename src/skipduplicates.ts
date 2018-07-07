import withStateMachine from "./withstatemachine";
import { none, Option, Some } from "./optional";
import { Desc, withDesc } from "./describe";
import Observable from "./observable";
import Event, { hasValue } from "./event"

export interface Equals<A> {
  (left: A, right: A): boolean
}
export function equals(a, b) { return a === b; }

function isNone(object){
  return ((typeof object !== "undefined" && object !== null) ? object._isNone : false)
};

export default function skipDuplicates<A>(src: Observable<A>, isEqual: Equals<A> = equals): Observable<A> {
  let desc = new Desc(src, "skipDuplicates", []);
  return withDesc(desc, withStateMachine<A, Option<A>, A>(none(), function(prev: Option<A>, event: Event<A>): [Option<A>, Event<A>[]] {
    if (!hasValue(event)) {
      return [prev, [event]];
    } else if (event.isInitial || isNone(prev) || !isEqual(prev.get(), <A>event.value)) {
      return [new Some(<any>event.value), [event]];
    } else {
      return [prev, []];
    }
  }, src))
}