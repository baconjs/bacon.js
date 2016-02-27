#!/usr/bin/env node

"use strict";

var fs = require("fs");
var shell = require('shelljs');

var testModules = fs.readdirSync("spec/specs");

testModules.forEach(function(moduleName) {
  var result = shell.exec("BABEL_ENV=test ./node_modules/.bin/mocha --compilers coffee:coffee-script/register,js:babel-register spec/specs/" + moduleName)
  if (result.code != 0)
    process.exit(result.code)
})
