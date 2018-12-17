import Observable from "./observable";
import Event from "./event";
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
    (state: State, event: Event<In>): [State, Event<Out>[]];
}
/** @hidden */
export declare function withStateMachine<In, State, Out>(initState: State, f: StateF<In, State, Out>, src: Observable<In>): Observable<Out>;
export default withStateMachine;
export declare function withStateMachineT<In, State, Out>(initState: State, f: StateF<In, State, Out>): Transformer<In, Out>;
