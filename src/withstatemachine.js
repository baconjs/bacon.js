import Observable from "./observable";
import { withDesc, Desc } from "./describe";
import { more, noMore } from "./reply";

Observable.prototype.withStateMachine = function(initState, f) {
  var state = initState;
  var desc = new Desc(this, "withStateMachine", [initState, f]);
  return withDesc(desc, this.withHandler(function(event) {
    var fromF = f(state, event);
    var [newState, outputs] = fromF;
    state = newState;
    var reply = more;
    for (var i = 0, output; i < outputs.length; i++) {
      output = outputs[i];
      reply = this.push(output);
      if (reply === noMore) {
        return reply;
      }
    }
    return reply;
  }));
};
