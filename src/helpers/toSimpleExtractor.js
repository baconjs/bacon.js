import isFunction from "./isFunction";

export default function toSimpleExtractor(args) {
  return function(key) {
    return function(value) {
      var fieldValue;
      if (!value) {
        return;
      } else {
        fieldValue = value[key];
        if (isFunction(fieldValue)) {
          return fieldValue.apply(value, args);
        } else {
          return fieldValue;
        }
      }
    };
  };
}