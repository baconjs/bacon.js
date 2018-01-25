process.env.BABEL_ENV="test";
require("babel-register")
Bacon = require "../dist/Bacon"
{noop, createNObservable, eventStream, title} = require "./MemTestHelper"

createStream = -> Bacon.once(1).map(->).flatMap(Bacon.once)

title createStream().toString()
createNObservable 700, createStream
