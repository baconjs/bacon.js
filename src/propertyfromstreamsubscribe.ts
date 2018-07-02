import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe"
import { assertFunction } from "./assert"
import { none } from "./optional"
import Property from "./property"
import { Subscribe } from "./types";
import { Desc } from "./describe";

export default function propertyFromStreamSubscribe<V>(desc: Desc, subscribe: Subscribe<V>): Property<V> {
  assertFunction(subscribe)
  return new Property(desc, streamSubscribeToPropertySubscribe(none(), subscribe))
}
