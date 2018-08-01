import "../concat";
import { EventStream } from "../observable";
import { Property } from "../observable";
/** @hidden */
export default function addPropertyInitValueToStream<V>(property: Property<V>, stream: EventStream<V>): Property<V>;
