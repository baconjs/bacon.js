import filter from "./filter";

export default function(x, xs) {
  return filter((function(y) {
    return y !== x;
  }), xs);
}