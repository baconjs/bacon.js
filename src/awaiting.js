import "./map";
import "./skipduplicates";

import { Desc, withDesc } from "./describe";
import Observable from "./observable";
import { groupSimultaneous_ } from "./groupsimultaneous";
import { allowSync } from "./eventstream";

export default function awaiting(other) {
  var desc = new Desc(this, "awaiting", [other]);
  return groupSimultaneous_([this, other], allowSync)
    .map((values) => values[1].length === 0)
    .toProperty(false)
    .skipDuplicates()
    .withDesc(desc)
}

Observable.prototype.awaiting = awaiting;
