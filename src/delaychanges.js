import addPropertyInitValueToStream from "./addpropertyinitialvaluetostream";
import { withDesc } from "./describe";
import Property from "./property";

Property.prototype.delayChanges = function(desc, f) {
  return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())));
};
