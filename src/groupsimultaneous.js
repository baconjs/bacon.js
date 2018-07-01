import Bacon from "./core";
import { when_ } from "./when";
import { BufferingSource } from "./source";
import { Desc, withDesc } from "./describe";
import { isArray } from "./helpers";
import EventStream from "./eventstream";
import _ from "./_"

export default function groupSimultaneous(...streams) {
  return groupSimultaneous_(streams)
}

export function groupSimultaneous_(streams, options) {
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  let sources = _.map(stream => new BufferingSource(stream), streams)

  let ctor = (desc, subscribe) => new EventStream(desc, subscribe, null, options)
  return withDesc(new Desc(Bacon, "groupSimultaneous", streams), when_(ctor, [sources, (function(...xs) { return xs; })]));
}

Bacon.groupSimultaneous = groupSimultaneous;
