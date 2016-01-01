import "./concat";
import "./endonerror";
import "./filter";
import "./flatmap";
import Exception from "./exception";
import repeat from "./repeat";
import _ from "./_";
import { withDesc, Desc } from "./describe";
import once from "./once";
import later from "./later";
import Bacon from "./core";

Bacon.retry = function(options) {
  if (!_.isFunction(options.source)) {
    throw new Exception("'source' option has to be a function");
  }
  var source = options.source;
  var retries = options.retries || 0;
  var maxRetries = options.maxRetries || retries;
  var delay = options.delay || function() {
    return 0;
  };
  var isRetryable = options.isRetryable || function() {
    return true;
  };
  var finished = false;
  var error = null;

  return withDesc(new Desc(Bacon, "retry", [options]), repeat(function() {
    function valueStream() {
      return source().endOnError().withHandler(function(event) {
        if (event.isError()) {
          error = event;
          if (!(isRetryable(error.error) && retries > 0)) {
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
        retriesDone: maxRetries - retries
      };
      var pause = later(delay(context)).filter(false);
      retries = retries - 1;
      return pause.concat(once().flatMap(valueStream));
    } else {
      return valueStream();
    }
  }));
};
