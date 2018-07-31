import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe"
import { assertFunction } from "./assert"
import { none } from "../optional"
import { Property } from "../observable";
import { Subscribe } from "../types";
import { Desc } from "../describe";

/** @hidden */
export default function propertyFromStreamSubscribe<V>(desc: Desc, subscribe: Subscribe<V>): Property<V> {
  assertFunction(subscribe)
  return new Property(desc, streamSubscribeToPropertySubscribe(none(), subscribe))
}
