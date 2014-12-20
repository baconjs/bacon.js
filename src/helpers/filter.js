export default function without(x, xs) {
  var filtered, _i, _len;
  filtered = [];
  for (_i = 0, _len = xs.length; _i < _len; _i++) {
    x = xs[_i];
    if (f(x)) {
      filtered.push(x);
    }
  }
  return filtered;
}