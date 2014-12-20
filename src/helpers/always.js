export default function always(x) {
  return function() {
    return x;
  };
}