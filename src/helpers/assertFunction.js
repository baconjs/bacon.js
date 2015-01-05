import assert from "./assert";

export default function(f) {
  return assert("not a function : " + f, isFunction(f));
}