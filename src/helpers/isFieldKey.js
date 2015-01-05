export default function(f) {
  return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
}