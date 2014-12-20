import isFunction from "./isFunction";
import isFieldKey from "./isFieldKey";
import slice from "./slice";
import withMethodCallSupport from "./withMethodCallSupport";
import partiallyApplied from "./partiallyApplied";
import toFieldExtractor from "./toFieldExtractor";
import always from "./always";

export default withMethodCallSupport(function() {
  var args, f;
  f = arguments[0];
  args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  if (isFunction(f)) {
    if (args.length) {
      return partiallyApplied(f, args);
    } else {
      return f;
    }
  } else if (isFieldKey(f)) {
    return toFieldExtractor(f, args);
  } else {
    return always(f);
  }
});