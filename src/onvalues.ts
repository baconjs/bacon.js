import { combineAsArray } from "./combine"

export default function onValues<V>(...args) {
  return combineAsArray(
    args.slice(0, args.length - 1)
  ).onValues(args[arguments.length - 1])
}