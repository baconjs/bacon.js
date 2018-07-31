import Observable from "./observable";
import { Desc } from "./describe";
import { EventSink } from "./types";
import Event from "./event"
import { Reply } from "./reply";
import { Transformer } from "./transform";

export interface StateF<In, State, Out> {
  (state: State, event: Event<In>): [State, Event<Out>[]]
}

/** @hidden */
export function withStateMachine<In,State,Out>(initState: State, f: StateF<In, State, Out>, src: Observable<In>): Observable<Out> {
  return src.transform<Out>(
    withStateMachineT(initState, f),
    new Desc(src, "withStateMachine", [initState, f])
  )
}

export default withStateMachine

function withStateMachineT<In,State,Out>(initState: State, f: StateF<In, State, Out>): Transformer<In, Out> {
  let state = initState;
  return (event: Event<In>, sink: EventSink<Out>) => {
    var fromF = f(state, event);
    var [newState, outputs] = fromF;
    state = newState;
    var reply = Reply.more;
    for (var i = 0; i < outputs.length; i++) {
      let output = outputs[i];
      reply = sink(output)
      if (reply === Reply.noMore) {
        return reply;
      }
    }
    return reply;
  }
}