### Notes on Running tests in IE8 and modern browsers
# IE8 is not supported by "chai". To be able to run Bacon tests in IE8,
# it is required to convert the Expect api to Assert api.
# The following steps generate Assert API equivalent tests in ie8 directory
# respective Expect API (wherever possible!) and browserify these IE 8 tests.

../node_modules/.bin/browserify --extension .coffee -t coffeeify ./mocha-harness-ie8.coffee > ../browsertest/bundle.js
