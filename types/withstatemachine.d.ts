import Observable from "./observable";
import Event from "./event";
export interface StateF<In, State, Out> {
    (state: State, event: Event<In>): [State, Event<Out>[]];
}
/** @hidden */
export declare function withStateMachine<In, State, Out>(initState: State, f: StateF<In, State, Out>, src: Observable<In>): Observable<Out>;
export default withStateMachine;
