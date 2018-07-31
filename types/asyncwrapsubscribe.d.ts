import { Subscribe } from "./types";
export default function asyncWrapSubscribe<V>(obs: any, subscribe: Subscribe<V>): Subscribe<V>;
