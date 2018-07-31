import Observable from "./observable";

var spies: Spy[] = []
var running = false

export interface Spy {
  (obs: Observable<any>): any
}

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

export const spy = (spy: Spy) => spies.push(spy)

export default spy
