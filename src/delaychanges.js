// build-dependencies: later
// build-dependencies: flatmap
// build-dependencies: addpropertyinitialvaluetostream

Bacon.Property.prototype.delayChanges = function(desc, f) {
  return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())));
};
