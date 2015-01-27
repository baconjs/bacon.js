#!/usr/bin/env node

"use strict";

var fs = require("fs");
var shell = require('shelljs');

var testModules = fs.readdirSync("spec/specs")
    .map(function(name) { return name.substring(0, name.length - 7)})

testModules.forEach(function(moduleName) {
  var result = shell.exec("./runtests " + moduleName)
  if (result.code != 0)
    process.exit(result.code)
})
