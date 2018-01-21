import Bacon from "./core";
import when from "./when";
import "./skipduplicates";
import { BufferingSource } from "./source";
import { Desc, withDesc } from "./describe";
import { isArray } from "./helpers";

export default function groupSimultaneous(...streams) {
  if (streams.length === 1 && isArray(streams[0])) {
    streams = streams[0];
  }
  var sources = (() => {
    var result = [];
    for (var i = 0, s; i < streams.length; i++) {
      s = streams[i];
      result.push(new BufferingSource(s));
    }
    return result;
  })();
  return withDesc(new Desc(Bacon, "groupSimultaneous", streams), when(sources, (function(...xs) { return xs; })));
}

Bacon.groupSimultaneous = groupSimultaneous;
