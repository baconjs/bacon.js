function Some(value) {
  this.value = value;
}

extend(Some.prototype, {
  _isSome: true,
  getOrElse() { return this.value; },
  get() { return this.value; },
  filter(f) {
    if (f(this.value) ) {
      return new Some(this.value);
    } else {
      return None;
    }
  },
  map(f) {
    return new Some(f(this.value));
  },
  forEach(f) {
    return f(this.value);
  },
  isDefined: true,
  toArray() { return [this.value]; },
  inspect() { return "Some(" + this.value + ")"; },
  toString() { return this.inspect(); }
});

var None = {
  _isNone: true,
  getOrElse(value) { return value; },
  filter() { return None; },
  map() { return None; },
  forEach() {},
  isDefined: false,
  toArray() { return []; },
  inspect() { return "None"; },
  toString() { return this.inspect(); }
};

var toOption = function(v) {
  if (((typeof v !== "undefined" && v !== null) ? v._isSome : undefined) || ((typeof v !== "undefined" && v !== null) ? v._isNone : undefined)) {
    return v;
  } else {
    return new Some(v);
  }
};
