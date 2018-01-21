import "./concat";
import { noMore } from './reply';
import EventStream from "./eventstream";
import { describe } from './describe';
import UpdateBarrier from './updatebarrier';
import { endEvent } from './event';

export default function addPropertyInitValueToStream(property, stream) {
  const justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
    let value;
    const unsub = property.dispatcher.subscribe(function(event) {
      if (!event.isEnd()) {
        value = event;
      }
      return noMore;
    });
    UpdateBarrier.whenDoneWith(justInitValue, function() {
      if ((typeof value !== "undefined" && value !== null)) {
        sink(value);
      }
      return sink(endEvent());
    });
    return unsub;
  });
  return justInitValue.concat(stream).toProperty();
}
