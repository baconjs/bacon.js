import "./map";
import "./skipduplicates";

import { Desc } from "./describe";
import { groupSimultaneous_ } from "./groupsimultaneous";
import { allowSync } from "./observable";
import Observable from "./observable";
import { Property } from "./observable";;

export default function awaiting(src: Observable<any>, other: Observable<any>): Property<boolean> {
  return groupSimultaneous_([src, other], allowSync)
    .map((values) => values[1].length === 0)
    .toProperty(false)
    .skipDuplicates()
    .withDesc(new Desc(src, "awaiting", [other]))
}