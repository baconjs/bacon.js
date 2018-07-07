import "./combine";
import "./map";
import Observable from "./observable";
import Property from "./property";
import { Desc, withDesc } from "./describe";

Observable.prototype.not = function() {
  return this.map(function(x) {
    return !x;
  }).withDesc(new Desc(this, "not", []));
};

Property.prototype.and = function(other) {
  return this.combine(other, function(x, y) {
    return x && y;
  }).withDesc(new Desc(this, "and", [other]));
};

Property.prototype.or = function(other) {
  return this.combine(other, function(x, y) {
    return x || y;
  }).withDesc(new Desc(this, "or", [other]));
};
