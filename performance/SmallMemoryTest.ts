process.env.BABEL_ENV="test";
require("babel-register");
const Bacon = require("../dist/Bacon");
const {noop, createNObservable, eventStream, title} = require("./MemTestHelper");

const createStream = () => Bacon.once(1).map(function() {}).flatMap(Bacon.once);

title(createStream().toString());
createNObservable(700, createStream);
