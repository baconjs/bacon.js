# build-dependencies: later
# build-dependencies: flatmap
# build-dependencies: addpropertyinitialvaluetostream

Bacon.Property :: delayChanges = (desc, f) ->
  withDesc(desc, addPropertyInitValueToStream(this, f(@changes())))

