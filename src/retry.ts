import "./concat";
import "./endonerror";
import "./filter";
import "./flatmap";
import Exception from "./exception";
import _ from "./_";
import { Desc } from "./describe";
import Observable from "./observable";
import { EventStream } from "./observable";
import { Error, Event, hasValue, isError } from "./event";
import { EventSink } from "./types";
import silence from "./silence";
import repeat from "./repeat";
import once from "./once";

interface RetryContext {
  error: any
  retriesDone: number
}

interface RetryOptions<V> {
  source: (number) => Observable<V>
  retries? : number
  delay?(context: RetryContext): number
  isRetryable?(error: any): boolean
}

export default function retry<V>(options: RetryOptions<V>): EventStream<V> {
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
  var errorEvent: Error<V> | null = null;

  return repeat<V>(function(count: number) {
    function valueStream(): Observable<V> {
      return source(count).endOnError().transform(function (event: Event<V>, sink: EventSink<V>) {
        if (isError(event)) {
          errorEvent = event;
          if (!(isRetryable(errorEvent.error) && (retries === 0 || retriesDone < retries))) {
            finished = true;
            return sink(event);
          }
        } else {
          if (hasValue(event)) {
            errorEvent = null;
            finished = true;
          }
          return sink(event);
        }
      });
    }

    if (finished) {
      return null;
    } else if (errorEvent) {
      var context = {
        error: errorEvent.error,
        retriesDone
      };
      var pause: EventStream<V> = silence(delay(context));
      retriesDone++
      return pause.concat(once(<any>null).flatMap(valueStream));
    } else {
      return valueStream();
    }
  }).withDesc(new Desc("Bacon", "retry", [options]));
}