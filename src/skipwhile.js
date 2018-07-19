import { assertObservableIsProperty } from "./assert";
import { Desc } from "./describe";
import { EventStream } from "./observable";
import { convertArgsToFunction } from "./functionconstruction";
import { more } from "./reply";

EventStream.prototype.skipWhile = function(f, ...args) {
  assertObservableIsProperty(f);
  var ok = false;
  return convertArgsToFunction(this, f, args, function(f) {
    return this.withHandler(function (event) {
      if (ok || !event.hasValue || !f(event.value)) {
        if (event.hasValue) {
          ok = true;
        }
        return this.push(event);
      } else {
        return more;
      }
    }).withDesc(new Desc(this, "skipWhile", [f]));
  });
};
