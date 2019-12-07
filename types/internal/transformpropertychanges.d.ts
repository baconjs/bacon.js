import "../concat";
import { Desc } from '../describe';
import { Property } from "../observable";
import { EventStreamDelay } from "../types";
/** @hidden */
export default function transformPropertyChanges<V>(property: Property<V>, f: EventStreamDelay<V>, desc: Desc): Property<V>;
