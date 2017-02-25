// build-dependencies: flatmap, later, filter, repeat, endonerror, once, concat

Bacon.retry = function(options) {
  if (!_.isFunction(options.source)) {
    throw new Exception("'source' option has to be a function");
  }
  var source = options.source;
  var retries = options.retries || 0;
  var retriesDone = 0
  var delay = options.delay || function() {
    return 0;
  };
  var isRetryable = options.isRetryable || function() {
    return true;
  };
  var finished = false;
  var error = null;

  return withDesc(new Bacon.Desc(Bacon, "retry", [options]), Bacon.repeat(function() {
    function valueStream() {
      return source().endOnError().withHandler(function(event) {
        if (event.isError()) {
          error = event;
          if (!(isRetryable(error.error) && (retries===0 || retriesDone < retries))) {
            finished = true;
            return this.push(event);
          }
        } else {
          if (event.hasValue()) {
            error = null;
            finished = true;
          }
          return this.push(event);
        }
      });
    }

    if (finished) {
      return null;
    } else if (error) {
      var context = {
        error: error.error,
        retriesDone
      };
      var pause = Bacon.later(delay(context)).filter(false);
      retriesDone++
      return pause.concat(Bacon.once().flatMap(valueStream));
    } else {
      return valueStream();
    }
  }));
};
