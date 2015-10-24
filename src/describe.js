// build-dependencies: _, source

function Desc(context, method, args) {
  this.context = context;
  this.method = method;
  this.args = args;
}

_.extend(Desc.prototype, {
  _isDesc: true,
  deps() {
    if (!this.cached) {
      this.cached = findDeps([this.context].concat(this.args));
    }
    return this.cached;
  },
  toString() {
    return _.toString(this.context) + "." + _.toString(this.method) + "(" + _.map(_.toString, this.args) + ")";
  }
});

var describe = function(context, method, ...args) {
  const ref = context || method;
  if (ref && ref._isDesc) {
    return context || method;
  } else {
    return new Desc(context, method, args);
  }
};

var withDesc = function(desc, obs) {
  obs.desc = desc;
  return obs;
};

var findDeps = function(x) {
  if (isArray(x)) {
    return _.flatMap(findDeps, x);
  } else if (isObservable(x)) {
    return [x];
  } else if ((typeof x !== "undefined" && x !== null) ? x._isSource : undefined) {
    return [x.obs];
  } else {
    return [];
  }
};

Bacon.Desc = Desc;
Bacon.Desc.empty = new Bacon.Desc("", "", []);
