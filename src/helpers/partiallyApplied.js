import slice from "./slice";

export default function(f, applied) {
  return function(...args) {
    return f.apply(null, applied.concat(args));
  };
}