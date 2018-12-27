import Observable from "./observable";

var spies: Spy[] = []
var running = false

export type Spy = (obs: Observable<any>) => any

/** @hidden */
export function registerObs(obs: Observable<any>) {
  if (spies.length) {
    if (!running) {
      try {
        running = true;
        spies.forEach(function(spy) {
          spy(obs);
        });
      } finally {
        running = false
      }
    }
  }
}

/**
 Adds your function as a "spy" that will get notified on all new Observables.
 This will allow a visualization/analytics tool to spy on all Bacon activity.
 */
export const spy = (spy: Spy) => spies.push(spy)

export default spy