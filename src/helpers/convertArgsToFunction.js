import Property from "../classes/Property";
import makeFunction from "./makeFunction";

export default function(obs, f, args, method) {
  var sampled;
  if (f instanceof Property) {
    sampled = f.sampledBy(obs, (p, s) => [p, s]);
    method.call(sampled, ([p, s]) => p)
      .map(([p, s]) => s);
  } else {
    f = makeFunction(f, args);
    method.call(obs, f);
  }
}