/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
process.env.BABEL_ENV="test";
require("babel-register");
const Bacon = require("../dist/Bacon");
const {noop, createNObservable, eventStream, title} = require("./MemTestHelper");

title("new EventStream");
createNObservable(700, eventStream);

title("new Bus()");
createNObservable(700, () => new Bacon.Bus());


title("Bacon.once(1)");
createNObservable(700, i => Bacon.once(i));

title("Bacon.never()");
createNObservable(700, () => Bacon.never());

title("EventStream::toProperty(1)");
createNObservable(700, () => eventStream().toProperty(1));

title("EventStream::toProperty(1).changes()");
createNObservable(700, () => eventStream().toProperty(1).changes());

title("EventStream::map(noop)");
createNObservable(700, () => eventStream().map(noop));

title("EventStream::filter(noop)");
createNObservable(700, () => eventStream().filter(noop));

title("EventStream::scan(0, noop)");
createNObservable(700, () => eventStream().scan(0, noop));

title("Bacon.sequentially(0, [1, 2])");
createNObservable(700, () => Bacon.sequentially(0, [1, 2]));

title("EventStream::take(5)");
createNObservable(700, () => eventStream().take(5));

title("EventStream::flatMap(noop)");
createNObservable(700, () => eventStream().flatMap(noop));

title("EventStream::combine(stream, noop)");
createNObservable(700, () => eventStream().combine(eventStream(), noop));

title("EventStream::combineAsArray(stream1, stream2, stream3, stream4)");
createNObservable(500, () => Bacon.combineAsArray(eventStream(), eventStream(), eventStream(), eventStream()));

title("EventStream::mergeAll(stream1, stream2, stream3, stream4)");
createNObservable(500, () => Bacon.mergeAll(eventStream(), eventStream(), eventStream(), eventStream()));

title("EventStream::groupBy(keyF, limitF)");
createNObservable(500, () => Bacon.sequentially(0, [1,2,3,4]).groupBy(x => x));

var diamond = function(src, width, depth) {
  if (depth === 0) {
    return src;
  } else {
    const branches = (__range__(1, width, true).map((s) => diamond(src.map(function() {}), width, depth-1)));
    return Bacon.combineAsArray(branches);
  }
};

title("Diamond-shaped Property graph");
createNObservable(100, () => diamond(eventStream(), 3, 5));

var combineTemplate = function(gen, width, depth) {
  if (depth === 0) {
    return gen();
  } else {
    const template = {};
    for (let i = 1, end = width, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      template[i] = combineTemplate(gen, width, depth-1);
    }
    return Bacon.combineTemplate(template);
  }
};

title("Bacon.combineTemplate");
createNObservable(100, () => combineTemplate(eventStream, 4, 4));

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}