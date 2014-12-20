import slice from "./slice";

export default function partiallyApplied(f, applied) {
  return function(...args) {
    return f.apply(null, applied.concat(args));
  };
}