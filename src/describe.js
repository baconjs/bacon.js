"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var _1 = require("./_");
var Desc = /** @class */ (function () {
    function Desc(context, method, args) {
        this._isDesc = true;
        //assert("context missing", context)
        //assert("method missing", method)
        //assert("args missing", args)
        this.context = context;
        this.method = method;
        this.args = args;
    }
    Desc.prototype.deps = function () {
        if (!this.cached) {
            this.cached = findDeps([this.context].concat(this.args));
        }
        return this.cached;
    };
    Desc.prototype.toString = function () {
        var args = _1["default"].map(_1["default"].toString, this.args);
        return _1["default"].toString(this.context) + "." + _1["default"].toString(this.method) + "(" + args + ")";
    };
    return Desc;
}());
exports.Desc = Desc;
;
function describe(context, method) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var ref = context || method;
    if (ref && ref._isDesc) {
        return context || method;
    }
    else {
        return new Desc(context, method, args);
    }
}
exports.describe = describe;
function withDesc(desc, obs) {
    obs.desc = desc;
    return obs;
}
exports.withDesc = withDesc;
function findDeps(x) {
    if (helpers_1.isArray(x)) {
        return _1["default"].flatMap(findDeps, x);
    }
    else if (helpers_1.isObservable(x)) {
        return [x];
    }
    else if ((typeof x !== "undefined" && x !== null) ? x._isSource : undefined) {
        return [x.obs];
    }
    else {
        return [];
    }
}
exports.findDeps = findDeps;
exports["default"] = describe;
