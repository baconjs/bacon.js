// build-dependencies: flatmaplatest, frombinder, once
Bacon.EventStream.prototype.bufferingDebounce = function(delay, timeout) {
    timeout = timeout || 10000;
    return withDesc(new Bacon.Desc(this, "bufferingDebounce", [delay, timeout]), this.flatMapLatest((function(buffer, stamp) {
        return function(value){
            buffer.length === 0 && (stamp = Date.now());
            buffer.push(value);
            return (stamp + timeout < Date.now()) ? Bacon.once(buffer.splice(0)) : Bacon.fromBinder(function(sink) {
                var timer = setTimeout(function() {
                    sink(buffer.splice(0));
                }, delay);
                return clearTimeout.bind(undefined, timer);
            });
        }
    })([])));
};

Bacon.Property.prototype.bufferingDebounce = function(delay, timeout) {
    return this.delayChanges(new Bacon.Desc(this, "bufferingDebounce", [delay, timeout]), function(changes) {
        return changes.bufferingDebounce(delay, timeout);
    });
};