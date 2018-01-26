import { extend, isArray, isObservable, assert } from "./helpers";
import _ from "./_";

export function Desc(context, method, args) {
  assert("context missing", context)
  assert("method missing", method)
  assert("args missing", args)
  this.context = context;
  this.method = method;
  this.args = args;
}

extend(Desc.prototype, {
  _isDesc: true,
  deps() {
    if (!this.cached) {
      this.cached = findDeps([this.context].concat(this.args));
    }
    return this.cached;
  },
  toString() {
    let args = _.map(_.toString, this.args)
    return  _.toString(this.context) + "." + _.toString(this.method) + "(" + args + ")";
  }
});

export function describe (context, method, ...args) {
  const ref = context || method;
  if (ref && ref._isDesc) {
    return context || method;
  } else {
    return new Desc(context, method, args);
  }
}

export function withDesc(desc, obs) {
  obs.desc = desc;
  return obs;
}

export function findDeps (x) {
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
