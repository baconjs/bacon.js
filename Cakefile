{exec} = require 'child_process'

task 'build', 'build bacon', (options) ->
  exec(
    [
      "coffee -o lib -c src/Bacon.coffee"
      "uglifyjs lib/Bacon.js > lib/Bacon.min.js"
    ].join(' && '), (err, stdout, stderr) ->
      if err then console.log stderr.trim()
  )
