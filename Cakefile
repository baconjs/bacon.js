{exec} = require 'child_process'

task 'build', 'build bacon', (options) ->
  exec(
    [
      "coffee -o lib -c src/Bacon.coffee"
      "sed 's/assert.*//' src/Bacon.coffee > lib/Bacon.noAsserts.coffee"
      "coffee -o lib -c lib/Bacon.noAsserts.coffee"
      "uglifyjs lib/Bacon.noAsserts.js > lib/Bacon.min.js"
      "rm lib/Bacon.noAsserts.*"
    ].join(' && '), (err, stdout, stderr) ->
      if err then console.log stderr.trim()
  )
