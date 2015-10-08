if (Symbol && Symbol.observable) {
  Symbol.observable;
} else {
  if (Symbol && typeof Symbol.for === 'function') {
    Symbol.for('observable');
  } else {
    '@@observable';
  }
}
