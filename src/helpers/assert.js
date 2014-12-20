import Exception from "./Exception";

export default function assert(message, condition) {
  if (!condition) {
    throw new Exception(message);
  }
}