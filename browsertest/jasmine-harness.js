(function() {
  var currentWindowOnload, expose, html, startJasmine, tap;

  expose = function(obj) {
    var key, _results;
    _results = [];
    for (key in obj) {
      _results.push(window[key] = obj[key]);
    }
    return _results;
  };

  expose(require('../spec/lib/jasmine.js'));

  html = require('../spec/lib/jasmine-html.js');

  tap = require('../spec/lib/jasmine.tap_reporter.js');

  expose(require('../spec/SpecHelper'));

  expose(require('../spec/Mock'));

  require('../spec/BaconSpec');

  require('../spec/PromiseSpec');

  describe('Basic Suite', function() {
    return it('Should pass a basic truthiness test.', function() {
      expect(true).toEqual(true);
      return expect(false).toEqual(false);
    });
  });

  startJasmine = function() {
    jasmine.getEnv().addReporter(new jasmine.TapReporter());
    return jasmine.getEnv().execute();
  };

  currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload != null) currentWindowOnload();
    return setTimeout(startJasmine, 1);
  };

}).call(this);
