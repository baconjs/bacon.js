#!/usr/bin/env bash
echo "compiling es6 tests from typescript"

for file in test/*.ts; do
	[ -r "$file" ] || break
	tsc --outDir test/es6-modules --target 'ES2018' --module 'es2015' --esModuleInterop $file > /dev/null
	ts_file_name=${file#test/}
	sed -i '' -E 's/import \* as Bacon from \"..\";/import \* as Bacon from \"..\/..\/dist\/Bacon.mjs\";/' test/es6-modules/${ts_file_name%.ts}.js
done

### particular path fixes
# alternative import for baconjs in two test files
sed -i '' -E 's/ from "../..";/ from \"..\/..\/dist\/Bacon.mjs\";/' test/es6-modules/_.js
sed -i '' -E 's/ from "../..";/ from \"..\/..\/dist\/Bacon.mjs\";/' test/es6-modules/combinetemplate.js

# util sources
sed -i '' -E 's/import \* as Bacon from \"..\/..\";/import \* as Bacon from \"..\/..\/..\/dist\/Bacon.mjs\";/' test/es6-modules/util/TickScheduler.js
sed -i '' -E 's/import \* as Bacon from \"..\/..\";/import \* as Bacon from \"..\/..\/..\/dist\/Bacon.mjs\";/' test/es6-modules/util/SpecHelper.js

### third party libraries which in JavaScript are needed to import the default export binding (I guess)
# zen-observable has an issue importing as ES module https://github.com/zenparsing/zen-observable/issues/62
# workaround in zen-observable 0.8.15
sed -i '' -E "s/import \* as Observable from 'zen-observable';/import Observable from 'zen-observable';/" test/es6-modules/fromesobservable.js
