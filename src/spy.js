var spies = [];
var registerObs = function(obs) {
  if (spies.length) {
    if (!registerObs.running) {
      try {
        registerObs.running = true;
        spies.forEach(function(spy) {
          spy(obs);
        });
      } finally {
        delete registerObs.running;
      }
    }
  }
};

Bacon.spy = (spy) => spies.push(spy);
