/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from "lodash";
import Bacon from "../dist/Bacon";
let runId = 0;

class Generator {
  constructor() {
    this.streams = [];
    this.counters = [];
  }

  stream() {
    const bus = new Bacon.Bus();
    this.streams.push(bus);
    this.counters.push(0);
    return bus;
  }

  ticks(count) {
    for (let i = 1, end = count, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      for (let j = 0; j < this.streams.length; j++) {
        const s = this.streams[j];
        const counter = (this.counters[j] += 1);
        s.push(counter);
      }
    }
    return null;
  }
}

var f = {
  generator() { return new Generator(); },
  everyNth(n, stream) {
    return stream.filter(x => (x % n) === 0);
  },
  withGenerator(fun, rounds) {
    if (rounds == null) { rounds = 100; }
    const myRunId = ++runId;
    const gen = f.generator();
    fun(gen).onValue(function(v) { if (myRunId !== runId) { return console.error("async result detected!"); } });
    return gen.ticks(rounds);
  },
  combineTemplate(gen, width, depth) {
    if (depth === 0) {
      return gen.stream();
    } else {
      const template = {};
      for (let i = 1, end = width, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        template[i] = f.combineTemplate(gen, width, depth - 1);
      }
      return Bacon.combineTemplate(template);
    }
  },
  diamond(src, width, depth) {
    if (depth === 0) {
      return src;
    } else {
      const branches = (__range__(1, width, true).map((s) => f.diamond(src.map(function() {}), width, depth - 1)));
      return Bacon.combineAsArray(branches);
    }
  },

  zip(gen) {
    return gen.stream().zip(gen.stream());
  }
};

const cases = {
  'diamondtree'() {
    return f.withGenerator((function(gen) {
      const tree = f.diamond(gen.stream(), 1, 100);
      const s = f.diamond(tree, 3, 5);
      s.onValue(function() {});
      return s;
    }),1);
  },
  'diamond'() {
    return f.withGenerator((function(gen) {
      const s = f.diamond(gen.stream(), 3, 5);
      s.onValue(function() {});
      return s;
    }),1);
  },
  'combo'() {
    return f.withGenerator((function(gen) {
      const s = f.combineTemplate(gen, 4, 4);
      s.onValue(function() {});
      return s;}), 1);
  },
  'zip'() {
    return f.withGenerator(gen => f.zip(gen));
  },
  'Creating streams'() {
    return Bacon.once();
  },
  'EventStream passthrough'() {
    return f.withGenerator(gen => gen.stream());
  },
  'EventStream.map'() {
    return f.withGenerator(gen => gen.stream().map(x => x * 2));
  },
  'EventStream.flatMap'() {
    return f.withGenerator(gen =>
      gen.stream().flatMap(x => Bacon.once(x * 2))
    );
  },
  'Bacon.combineTemplate.sample'() {
    return f.withGenerator(gen =>
      f.combineTemplate(gen, 5, 1)
        .sampledBy(f.everyNth(10, gen.stream()))
    );
  },
  'Bacon.combineTemplate (deep)'() {
    return f.withGenerator(gen => f.combineTemplate(gen, 3, 3));
  },
  'Bacon.combineTemplate'() {
    return f.withGenerator(gen => f.combineTemplate(gen, 5, 1));
  },
  'EventStream.scan'() {
    return f.withGenerator(gen => gen.stream().scan(0, (x,y) => x+y));
  },
  'EventStream.toProperty'() {
    return f.withGenerator(gen => gen.stream().toProperty());
  },
  'EventStream.holdWhen'() {
    return f.withGenerator(gen => gen.stream().holdWhen(gen.stream().map(false)));
  }
};


const includeCase = function(key) {
  const args = process.argv.slice(2);
  if (args.length) {
    return args.some(arg => key.toLowerCase().indexOf(arg.toLowerCase()) >= 0);
  } else {
    return true;
  }
};

export default _.pickBy(cases, ((value, key) => includeCase(key)));

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}