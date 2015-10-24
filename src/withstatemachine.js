// build-dependencies: observable, property, combine

Bacon.Observable.prototype.withStateMachine = function(initState, f) {
  var state = initState;
  var desc = new Bacon.Desc(this, "withStateMachine", [initState, f]);
  return withDesc(desc, this.withHandler(function(event) {
    var fromF = f(state, event);
    var [newState, outputs] = fromF;
    state = newState;
    var reply = Bacon.more;
    for (var i = 0, output; i < outputs.length; i++) {
      output = outputs[i];
      reply = this.push(output);
      if (reply === Bacon.noMore) {
        return reply;
      }
    }
    return reply;
  }));
};
