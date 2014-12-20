var idCounter = 0;

export class Event {
  constructor() {
    this.id = ++idCounter;
  }
  isEvent() {
    return true;
  }
  isEnd() {
    return false;
  }
  isInitial() {
    return false;
  }
  isNext() {
    return false;
  }
  isError() {
    return false;
  }
  hasValue() {
    return false;
  }
  filter() {
    return true;
  }
  inspect() {
    return this.toString();
  }
  log() {
    return this.toString();
  }
}