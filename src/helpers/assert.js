import Exception from "./Exception";

export default function(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
}