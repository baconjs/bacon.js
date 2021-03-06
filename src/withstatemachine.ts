import Observable from "./observable";
import { Desc } from "./describe";
import { EventSink } from "./types";
import Event from "./event"
import { more, noMore } from "./reply";
import { Transformer } from "./transform";

/** 
 *  State machine function used in [withStateMachine](classes/observable.html#withstatemachine).
 */
export interface StateF<In, State, Out> {
  /**
   *
   * @param state current state of the state machine.
   * @param event input event to react on
   * @return a tuple containing the next state and an array of events to be emitted.
@typeparam  State   type of machine state
@typeparam  Out     type of values to be emitted
@typeparam  In     type of values in the input events
   */
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

export function withStateMachineT<In,State,Out>(initState: State, f: StateF<In, State, Out>): Transformer<In, Out> {
  let state = initState;
  return (event: Event<In>, sink: EventSink<Out>) => {
    var fromF = f(state, event);
    var [newState, outputs] = fromF;
    state = newState;
    var reply = more;
    for (var i = 0; i < outputs.length; i++) {
      let output = outputs[i];
      reply = sink(output)
      if (reply === noMore) {
        return reply;
      }
    }
    return reply;
  }
}
