import { isArray, isObservable } from "./helpers"
import _ from "./_"

interface Observable {
}

export class Desc {
  context: any
  method?: string
  args?: any[]
  cached?: Observable[]
  constructor(context: any, method: string, args: any[] = []) {
    //assert("context missing", context)
    //assert("method missing", method)
    //assert("args missing", args)
    this.context = context;
    this.method = method;
    this.args = args;
  }
  _isDesc: boolean = true
  deps(): Observable[] {
    if (!this.cached) {
      this.cached = findDeps([this.context].concat(this.args));
    }
    return this.cached;
  }
  toString() {
    let args = _.map(_.toString, this.args)
    return  _.toString(this.context) + "." + _.toString(this.method) + "(" + args + ")";
  }
};

export function describe (context, method, ...args) {
  const ref = context || method;
  if (ref && ref._isDesc) {
    return context || method;
  } else {
    return new Desc(context, method, args);
  }
}

// TODO: untyped function
export function withDesc(desc: Desc | undefined, obs) {
  if (desc) obs.desc = desc;
  return obs;
}

export function findDeps (x): Observable[] {
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
