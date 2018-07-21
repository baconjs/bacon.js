import { combineAsArray } from "./combine"

export function onValues<V>(...args) {
  return combineAsArray(
    args.slice(0, args.length - 1)
  ).onValues(args[arguments.length - 1])
}