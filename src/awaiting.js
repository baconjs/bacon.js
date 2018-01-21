import "./map";
import "./skipduplicates";

import { Desc, withDesc } from "./describe";
import Observable from "./observable";
import groupSimultaneous from "./groupsimultaneous";

export default function awaiting(other) {
  var desc = new Desc(this, "awaiting", [other]);
  return withDesc(desc, groupSimultaneous(this, other)
    .map((values) => values[1].length === 0)
    .toProperty(false).skipDuplicates());
}

Observable.prototype.awaiting = awaiting;
