export default function isFieldKey(f) {
  return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
}