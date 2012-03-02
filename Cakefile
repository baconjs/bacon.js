{exec} = require 'child_process'

task 'build', 'build bacon', (options) ->
  exec(
    [
      "coffee -o lib -c src/Bacon.coffee"
    ].join(' && '), (err, stdout, stderr) ->
      if err then console.log stderr.trim()
  )
