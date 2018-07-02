export function symbol(key) {
  if (typeof Symbol !== "undefined" && Symbol[key]) {
    return Symbol[key];
  } else if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
    return Symbol[key] = Symbol.for(key);
  } else {
    return "@@" + key;
  }
}