#!/usr/bin/env bash
set -e

# remove files
for file in test/es6-modules/*.js; do
	test "$file" = test/es6-modules/es6-module.js && continue
	rm "$file"
done

rm test/es6-modules/util/*.js
rmdir test/es6-modules/util/