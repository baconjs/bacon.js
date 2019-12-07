import "../concat";
import { more } from '../reply';
import {EventStream, allowSync } from "../observable";
import { describe, Desc } from '../describe';
import UpdateBarrier from './updatebarrier';
import { Event, isInitial, Initial } from '../event';
import { Property } from "../observable";;
import { EventSink, EventStreamDelay } from "../types";
import propertyFromStreamSubscribe from "./propertyfromstreamsubscribe";

/** @hidden */
export default function transformPropertyChanges<V>(property: Property<V>, f: EventStreamDelay<V>, desc: Desc): Property<V> {
  let initValue: Initial<V> | undefined
  let comboSink: EventSink<V> | undefined;

  // Create a `changes` stream to be transformed, which also snatches the Initial value for later use.
  const changes = new EventStream<V>(
    describe(property, "changes", []),
    (sink) => property.dispatcher.subscribe(function (event: Event<V>) {
      if (!initValue && isInitial(event)) {
        initValue = event;

        UpdateBarrier.whenDoneWith(combo, function() {
          if (!comboSink) {
            throw new Error("Init sequence fail")
          }
          comboSink(initValue!);
        });
      }

      if (!event.isInitial) {
        return sink(event);
      }
      return more
    }),
    undefined,
    allowSync
  )

  const transformedChanges = f(changes)

  const combo = propertyFromStreamSubscribe<V>(desc, (sink) => {
    comboSink = sink;

    return transformedChanges.dispatcher.subscribe(function (event: Event<V>) {
      sink(event)
    })
  })

  return combo
}
