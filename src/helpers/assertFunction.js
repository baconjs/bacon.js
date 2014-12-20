import assert from "./assert";

export default function assertFunction(f) {
  return assert("not a function : " + f, isFunction(f));
}