import streamSubscribeToPropertySubscribe from "./streamsubscribetopropertysubscribe"
import { assertFunction } from "./assert"
import { none } from "./optional"
import Property from "./property"

export default function propertyFromStreamSubscribe(desc, subscribe) {
  assertFunction(subscribe)
  return new Property(desc, streamSubscribeToPropertySubscribe(none(), subscribe))
}
