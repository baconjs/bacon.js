export default function(f, xs) {
  var x, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = xs.length; _i < _len; _i++) {
    x = xs[_i];
    _results.push(f(x));
  }
  return _results;

}