var idCounter = 0;

export class Event {
  constructor() {
  	this.id = ++idCounter;
  }
  get isEvent() {
  	return true;
  }
  get isEnd() {
  	return false;
  }
  get isInitial(){
  	return false;
  }
  get isNext() {
  	return false;
  }
  get isError() {
  	return false;
  }
  get hasValue() {
  	return false;
  }
  get filter() {
  	return true;
  }
  get inspect() {
  	return this.toString();
  }
  get log(){
  	return this.toString();
  }
}