import Event from "./Event";
import toString from "../helpers/toString";

export default class Error extends Event {
  constructor(error) {
    this.error = error;
  }
  isError() {
    return true;
  }
  fmap() {
    return this;
  }
  apply() {
    return this;
  }
  toString() {
    return "<error> " + toString(this.error);
  }
}