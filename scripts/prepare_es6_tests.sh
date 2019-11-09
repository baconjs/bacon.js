#!/usr/bin/env bash
echo "compiling es6 tests from typescript"
cd test
tsc --outDir es6-modules --target 'ES2018' --module 'es2015' --esModuleInterop awaiting.ts > /dev/null
tsc --outDir es6-modules --target 'ES2018' --module 'es2015' --esModuleInterop boolean.ts > /dev/null

sed -i '' -E 's/import \* as Bacon from \"..\";/import \* as Bacon from \"..\/..\/dist\/Bacon.mjs\";/' es6-modules/awaiting.js
sed -i '' -E 's/import \* as Bacon from \"..\";/import \* as Bacon from \"..\/..\/dist\/Bacon.mjs\";/' es6-modules/boolean.js

sed -i '' -E 's/import \* as Bacon from \"..\/..\";/import \* as Bacon from \"..\/..\/..\/dist\/Bacon.mjs\";/' es6-modules/util/TickScheduler.js
sed -i '' -E 's/import \* as Bacon from \"..\/..\";/import \* as Bacon from \"..\/..\/..\/dist\/Bacon.mjs\";/' es6-modules/util/SpecHelper.js

#todo: try this
#for file in test/*.ts; do
#	[ -f "$file" ] || break
#	tsc --outDir test/es6-modules --target 'ES2018' --module 'es2015' --esModuleInterop $file > /dev/null
#	sed -i '' -E 's/import \* as Bacon from \"..\";/import \* as Bacon from \"..\/..\/dist\/Bacon.mjs\";/' ${file%.ts}.js
#done

