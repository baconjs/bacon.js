import Bacon from "./core";
import { when_ } from "./when";
import "./skipduplicates";
import { BufferingSource } from "./source";
import { Desc, withDesc } from "./describe";
import { isArray } from "./helpers";
import { defaultOptions } from "./eventstream";
import EventStream from "./eventstream";

export default function groupSimultaneous(...streams) {
  return groupSimultaneous_(streams)
}

export function groupSimultaneous_(streams, options = defaultOptions) {
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  var sources = (() => {
    var result = [];
    for (var i = 0; i < streams.length; i++) {
      result.push(new BufferingSource(streams[i]));
    }
    return result;
  })();
  let ctor = (desc, subscribe) => new EventStream(desc, subscribe, null, options)
  return withDesc(new Desc(Bacon, "groupSimultaneous", streams), when_(ctor, [sources, (function(...xs) { return xs; })]));
}

Bacon.groupSimultaneous = groupSimultaneous;
