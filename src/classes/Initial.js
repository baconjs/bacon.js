import Next from "./Next";

export default class Initial extends Next {
  constructor() {}
  isInitial() {
    return true;
  }
  isNext() {
    return false;
  }
  apply(value) {
    return new Initial(value);
  }
  toNext() {
    return new Next(this);
  }
}