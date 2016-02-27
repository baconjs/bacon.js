import "./combine";
import "./map";
import Observable from "./observable";
import Property from "./property";
import { Desc, withDesc } from "./describe";

Observable.prototype.not = function() {
  return withDesc(new Desc(this, "not", []), this.map(function(x) {
    return !x;
  }));
};

Property.prototype.and = function(other) {
  return withDesc(new Desc(this, "and", [other]), this.combine(other, function(x, y) {
    return x && y;
  }));
};

Property.prototype.or = function(other) {
  return withDesc(new Desc(this, "or", [other]), this.combine(other, function(x, y) {
    return x || y;
  }));
};
