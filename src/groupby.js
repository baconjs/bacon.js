import "./concat";
import "./filter";
import "./map";

import _ from "./_";
import once from "./once";
import Observable from "./observable";

Observable.prototype.groupBy = function(keyF, limitF = _.id) {
  var streams = {};
  var src = this;
  return src
    .filter(function(x) { return !streams[keyF(x)]; })
    .map(function(x) {
      var key = keyF(x);
      var similar = src.filter(function(x) { return keyF(x) === key; });
      var data = once(x).concat(similar);
      var limited = limitF(data, x).withHandler(function(event) {
        this.push(event);
        if (event.isEnd) {
          return delete streams[key];
        }
      });
      streams[key] = limited;
      return limited;
    });
};
