import { Property } from "../observable";
import { Subscribe } from "../types";
import { Desc } from "../describe";
/** @hidden */
export default function propertyFromStreamSubscribe<V>(desc: Desc, subscribe: Subscribe<V>): Property<V>;
