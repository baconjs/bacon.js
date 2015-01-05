import map from "./map";
import toSimpleExtractor from "./toSimpleExtractor";

export default function(f, args) {
  var partFuncs, parts;
  parts = f.slice(1).split(".");
  partFuncs = map(toSimpleExtractor(args), parts);
  return function(value) {
    var _i, _len;
    for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
      f = partFuncs[_i];
      value = f(value);
    }
    return value;
  };
}