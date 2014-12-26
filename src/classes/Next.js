import Event from "./Event";
import Next from "./Next";
import isFunction from "../helpers/isFunction";
import toString from "../helpers/toString";

export default class Next extends Event {
  constructor(valueF, eager) {
    super();
    if (!eager && isFunction(valueF) || valueF instanceof Next) {
      this.valueF = valueF;
    } else {
      this.valueInternal = valueF;
    }
  }
  isNext() {
    return true;
  }
  hasValue() {
    return true;
  }
  value() {
    if (this.valueF instanceof Next) {
      this.valueInternal = this.valueF.value();
    } else if (this.valueF) {
      this.valueInternal = this.valueF();
    }
    return this.valueInternal;
  }
  apply(value) {
    return new Next(value);
  }
  filter(f) {
    return f(this.value());
  }
  toString() {
    return toString(this.value());
  }
  log() {
    return this.value();
  }
}