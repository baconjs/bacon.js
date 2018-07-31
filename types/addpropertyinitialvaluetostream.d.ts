import "./concat";
import { EventStream } from "./observable";
import { Property } from "./observable";
export default function addPropertyInitValueToStream<V>(property: Property<V>, stream: EventStream<V>): Property<V>;
