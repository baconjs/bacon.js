export default {
  setTimeout(f,d) { return setTimeout(f,d); },
  setInterval(f, i) { return setInterval(f, i); },
  clearInterval(id) { return clearInterval(id); },
  clearTimeout(id) { return clearTimeout(id); },
  now() { return new Date().getTime(); }
};
