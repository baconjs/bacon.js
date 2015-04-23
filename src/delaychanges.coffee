# build-dependencies: later
# build-dependencies: flatmap
# build-dependencies: addpropertyinitialvaluetostream

Bacon.Property :: delayChanges = (desc..., f) ->
  withDescription(this, desc...,
    addPropertyInitValueToStream(this, f(@changes())))

