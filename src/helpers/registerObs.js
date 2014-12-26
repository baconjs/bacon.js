import spys from "../globals/spys";

export default function registerObs(obs) {
  if (spys.length) {
    if (!registerObs.running) {
      try {
        registerObs.running = true;
        for (let spy of spys) {
          spy(obs);
        }
      } finally {
        delete registerObs.running;
      }
    }
  }
}