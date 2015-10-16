// build-dependencies: core
// build-dependencies: addpropertyinitialvaluetostream
// build-dependencies: mapend
// build-dependencies: skiperrors
// build-dependencies: groupsimultaneous

Bacon.EventStream.prototype.takeUntil = function(stopper) {
  var endMarker = {};
  return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors())
    .withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        var [data, stopper] = event.value();
        if (stopper.length) {
//            console.log(_.toString(data), "stopped by", _.toString(stopper))
          return this.push(endEvent());
        } else {
          var reply = Bacon.more;
          for (var i = 0, value; i < data.length; i++) {
            value = data[i];
            if (value === endMarker) {
              reply = this.push(endEvent());
            } else {
              reply = this.push(nextEvent(value));
            }
          }
          return reply;
        }
      }
    }
    ));
};

Bacon.Property.prototype.takeUntil = function(stopper) {
  var changes = this.changes().takeUntil(stopper);
  return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), addPropertyInitValueToStream(this, changes));
};
