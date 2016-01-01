var spies = [];
export function registerObs(obs) {
  if (spies.length) {
    if (!registerObs.running) {
      try {
        registerObs.running = true;
        spies.forEach(function(spy) {
          spy(obs);
        });
      } finally {
        delete registerObs.running;
      }
    }
  }
}

export default (spy) => spies.push(spy);
