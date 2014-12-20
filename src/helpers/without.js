import filter from "./filter";

export default function without(x, xs) {
  return filter((function(y) {
    return y !== x;
  }), xs);
}