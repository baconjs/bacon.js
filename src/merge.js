import EventStream from "./eventstream";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { argumentsToObservables } from "./argumentstoobservables";
import { assertEventStream } from "./helpers";
import never from "./never";
import _ from "./_";
import { noMore, more } from "./reply";
import { endEvent } from "./event";
import { withDesc, Desc } from "./describe";
import Bacon from "./core";

EventStream.prototype.merge = function(right) {
  assertEventStream(right);
  var left = this;
  return withDesc(new Desc(left, "merge", [right]), mergeAll(this, right));
};

function mergeAll() {
  var streams = argumentsToObservables(arguments);
  if (streams.length) {
    return new EventStream(new Desc(Bacon, "mergeAll", streams), function(sink) {
      var ends = 0;
      var smartSink = function(obs) {
        return function(unsubBoth) {
          return obs.dispatcher.subscribe(function(event) {
            if (event.isEnd) {
              ends++;
              if (ends === streams.length) {
                return sink(endEvent());
              } else {
                return more;
              }
            } else {
              event = event.toNext()
              var reply = sink(event);
              if (reply === noMore) { unsubBoth(); }
              return reply;
            }
          });
        };
      };
      var sinks = _.map(smartSink, streams);
      return new CompositeUnsubscribe(sinks).unsubscribe;
    });
  } else {
    return never();
  }
}

Bacon.mergeAll = mergeAll;
