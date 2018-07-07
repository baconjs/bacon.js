import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import Property from "./property";
import EventStream from "./eventstream";

Property.prototype.delayChanges = function(desc, f) {
  return addPropertyInitValueToStream(this, f(this.changes())).withDesc(desc)
}

EventStream.prototype.delayChanges = function(desc, f) {
  return f(this).withDesc(desc)
}
