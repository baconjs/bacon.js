import Event from "./Event";

export class End extends Event {
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