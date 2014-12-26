import Event from "./Event";

export default class End extends Event {
  constructor() {}
  isEnd() {
    return true;
  }
  fmap() {
    return this;
  }
  apply() {
    return this;
  }
  toString() {
    return "<end>";
  }
}