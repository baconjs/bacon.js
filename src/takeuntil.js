// build-dependencies: core, eventstream, property
// build-dependencies: addpropertyinitialvaluetostream
// build-dependencies: mapend
// build-dependencies: skiperrors
// build-dependencies: groupsimultaneous

Bacon.Observable.prototype.takeUntil = function(stopper) {
  var endMarker = {};
  let withEndMarker = Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors())
  if (this instanceof Property) withEndMarker = withEndMarker.toProperty()
  let impl = withEndMarker.withHandler(function(event) {
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
    )
  return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), impl);
};
