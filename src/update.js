import { Desc } from "./describe";
import { when } from "./when";
import _ from "./_";
import "./scan";
import Bacon from "./core";

export default function update(initial, ...patterns) {
  function lateBindFirst(f) {
    return function(...args) {
      return function(i) {
        return f(...[i].concat(args));
      };
    };
  }

  var i = patterns.length - 1;
  while (i > 0) {
    if (!(patterns[i] instanceof Function)) {
      patterns[i] = _.always(patterns[i]);
    }
    patterns[i] = lateBindFirst(patterns[i]);
    i = i - 2;
  }
  return when(...patterns).scan(initial, (function (x, f) {
    return f(x);
  })).withDesc(new Desc(Bacon, "update", [initial, ...patterns]));
}

Bacon.update = update;
