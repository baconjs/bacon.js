import { isArray, isObservable } from "./helpers"
import Observable from "./observable"
import _ from "./_"

export class Desc {
  context: any
  method?: string
  args: any[]
  /** @hidden */
  cachedDeps?: Observable<any>[]
  /** @hidden */
  _isDesc: boolean = true
  constructor(context: any, method: string, args: any[] = []) {
    //assert("context missing", context)
    //assert("method missing", method)
    //assert("args missing", args)
    this.context = context;
    this.method = method;
    this.args = args;
  }
  deps(): Observable<any>[] {
    if (!this.cachedDeps) {
      this.cachedDeps = findDeps([this.context].concat(this.args));
    }
    return this.cachedDeps;
  }
  toString() {
    let args = _.map(_.toString, this.args)
    return  _.toString(this.context) + "." + _.toString(this.method) + "(" + args + ")";
  }
};

/** @hidden */
export function describe (context: any, method: string, ...args: any[]): Desc {
  const ref = context || method;
  if (ref && ref._isDesc) {
    return context || method;
  } else {
    return new Desc(context, method, args);
  }
}

/** @hidden */
export function findDeps (x: any): Observable<any>[] {
  if (isArray(x)) {
    return _.flatMap(findDeps, x);
  } else if (isObservable(x)) {
    return [x];
  } else if ((typeof x !== "undefined" && x !== null) ? x._isSource : undefined) {
    return [x.obs];
  } else {
    return [];
  }
}

export default describe
