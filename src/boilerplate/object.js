var Bacon = {
  toString() { return "Bacon"; }
};

Bacon.version = '<version>';

// Bacon has own Error
var Exception = ((typeof global !== "undefined" && global !== null) ? global : this).Error;
