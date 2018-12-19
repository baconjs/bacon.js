import Observable from "./observable";
import { endEvent, isEnd, nextEvent } from "./event";
import { more, noMore } from "./reply";

/** @hidden */
export default function endAsValue(src: Observable<any>): Observable<{}> {
  return src.transform((event, sink) => {
    if (isEnd(event)) {
      sink(nextEvent({}))
      sink(endEvent())
      return noMore
    }
    return more
  })
}
