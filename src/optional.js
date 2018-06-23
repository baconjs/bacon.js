"use strict";
exports.__esModule = true;
var Some = /** @class */ (function () {
    function Some(value) {
        this.isDefined = true;
        this.value = value;
    }
    Some.prototype.getOrElse = function (arg) { return this.value; };
    Some.prototype.get = function () { return this.value; };
    Some.prototype.filter = function (f) {
        if (f(this.value)) {
            return new Some(this.value);
        }
        else {
            return None;
        }
    };
    Some.prototype.map = function (f) {
        return new Some(f(this.value));
    };
    Some.prototype.forEach = function (f) {
        f(this.value);
    };
    Some.prototype.toArray = function () { return [this.value]; };
    Some.prototype.inspect = function () { return "Some(" + this.value + ")"; };
    Some.prototype.toString = function () { return this.inspect(); };
    return Some;
}());
exports.Some = Some;
var None = {
    _isNone: true,
    getOrElse: function (value) { return value; },
    get: function () { throw new Error("None.get()"); },
    filter: function () { return None; },
    map: function () { return None; },
    forEach: function () { },
    isDefined: false,
    toArray: function () { return []; },
    inspect: function () { return "None"; },
    toString: function () { return this.inspect(); }
};
exports.None = None;
function none() { return None; }
exports.none = none;
function toOption(v) {
    if (v && (v._isSome || v._isNone)) {
        return v;
    }
    else {
        return new Some(v);
    }
}
exports.toOption = toOption;
;
