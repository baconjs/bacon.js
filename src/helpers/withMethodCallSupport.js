import slice from "./slice";

export default function(wrapped) {
  return function(...args) {
    var context, f, methodName;
    f = arguments[0];
    if (typeof f === "object" && args.length) {
      context = f;
      methodName = args[0];
      f = function() {
        return context[methodName].apply(context, arguments);
      };
      args = args.slice(1);
    }
    return wrapped.apply(null, [f].concat(slice.call(args)));
  };
}