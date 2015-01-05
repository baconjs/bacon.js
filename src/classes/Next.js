import Event from "./Event";
import isFunction from "../helpers/isFunction";
import toString from "../helpers/toString";

export default class Next extends Event {
  constructor(valueF, eager) {
    super();
    if (!eager && isFunction(valueF) || valueF instanceof Bacon.Next) {
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
    if (this.valueF instanceof Bacon.Next) {
      this.valueInternal = this.valueF.value();
    } else if (this.valueF) {
      this.valueInternal = this.valueF();
    }
    return this.valueInternal;
  }
  apply(value) {
    return new Bacon.Next(value);
  }
  filter(f) {
    return f(this.value());
  }
  toString() {
    return _.toString(this.value());
  }
  log() {
    return this.value();
  }
}