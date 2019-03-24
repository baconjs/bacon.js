/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Bacon from "../dist/Bacon";
const toKb = x => (x / 1024).toFixed(2) + ' KiB';
const toMb = x => (x / 1024 / 1024).toFixed(2) + ' MiB';

const byteFormat = function(bytes, comparison) {
  if (Math.abs(comparison || bytes) > (512 * 1024)) {
    return toMb(bytes);
  } else {
    return toKb(bytes);
  }
};

const lpad = function(string, length) {
  if (length == null) { length = 12; }
  while(string.length < length) {
    string = ` ${string}`;
  }
  return string;
};

const rpad = function(string, length) {
  if (length == null) { length = 12; }
  while(string.length < length) {
    string = `${string} `;
  }
  return string;
};
const measure = function(fun) {
  global.gc();
  const lastMemoryUsage = process.memoryUsage().heapUsed;
  const startTime = Date.now();
  fun();
  const duration = Date.now() - startTime;
  global.gc();
  return [process.memoryUsage().heapUsed - lastMemoryUsage, duration];
};

const sum = xs => xs.reduce((sum, x) => sum + x);
const mean = xs => sum(xs) / xs.length;
const stddev = function(xs) {
  const avg = mean(xs);
  return Math.pow(mean(Array.from(xs).map((x) => Math.pow((x - avg), 2))), 0.5);
};

const processResults = function(results, i) {
  const values = (Array.from(results).map((x) => x[i]));

  return {
    mean: mean(values.slice(2)),
    stddev: stddev(values.slice(2))
  };
};

const printResult = function(label, result, forcePrefix) {
  if (forcePrefix == null) { forcePrefix = false; }
  var prefix = prefix && (result.mean > 0) ? '+' : '';
  return console.log(`  ${rpad(label, 20)}`, lpad(prefix + byteFormat(result.mean), 12), '\u00b1', byteFormat(result.stddev, result.mean));
};
const createNObservable = function(count, generator) {
  let withoutSubscriber, withSubscriber, afterCleanup, reSubscribe, afterReCleanup;
  const n = Math.floor(count / 10);
  const m = 10;

  const results = (() => {
    const result = [];
    for (var j = 0, i = j, end = m, asc = 0 <= end; asc ? j < end : j > end; asc ? j++ : j--, i = j) {
      global.gc();
      var objects = new Array(n); // Preallocate array of n elements
      var unsubscribers = new Array(n);
      const subscribe = () =>
        (() => {
          let asc1, end1;
          const result1 = [];
          for (i = 0, end1 = objects.length, asc1 = 0 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
            result1.push(unsubscribers[i] = objects[i].onValue(noop));
          }
          return result1;
        })()
      ;
      const unsubscribe = () =>
        (() => {
          let asc1, end1;
          const result1 = [];
          for (i = 0, end1 = objects.length, asc1 = 0 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
            unsubscribers[i]();
            result1.push(unsubscribers[i] = null);
          }
          return result1;
        })()
      ;

      global.gc();
      withoutSubscriber = measure(() =>
        (() => {
          let asc1, end1;
          const result1 = [];
          for (i = 0, end1 = objects.length, asc1 = 0 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
            result1.push(objects[i] = generator(i));
          }
          return result1;
        })());

      withSubscriber = measure(subscribe);
      afterCleanup = measure(unsubscribe);
      reSubscribe = measure(subscribe);
      afterReCleanup = measure(unsubscribe);

      objects = null;
      unsubscribers = null;
      result.push([withoutSubscriber[0]/n, withSubscriber[0]/n, afterCleanup[0]/n, reSubscribe[0]/n, afterReCleanup[0]/n]);
    }
    return result;
  })();

  withoutSubscriber = processResults(results, 0);
  withSubscriber = processResults(results, 1);
  afterCleanup = processResults(results, 2);
  reSubscribe = processResults(results, 3);
  afterReCleanup = processResults(results, 4);

  printResult('w/o subscription', withoutSubscriber);
  printResult('with subscription', withSubscriber, true);
  printResult('unsubscribe', afterCleanup, true);
  printResult('subscribe again', reSubscribe, true);
  return printResult('unsubscribe again', afterReCleanup, true);
};

const title = text => console.log(`\n${text}`);
var noop = function() {};


// Keep reference to listeners during test run
const fakeSource = {
  listeners: [],
  subscribe(listener) { return this.listeners.push(listener); },
  unsubscribe(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) { return this.listeners.splice(index, 1); }
  }
};


const eventStream = () =>
  new Bacon.EventStream(function(sink) {
    fakeSource.subscribe(sink);
    return () => fakeSource.unsubscribe(sink);
  })
;


export default { createNObservable, eventStream, title, noop };
