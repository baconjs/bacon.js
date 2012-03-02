bacon.js
========

A small reactive programming lib for js.

~~~ coffeescript
keyCodeIs = (keyCode) -> { event -> event.keyCode == keyCode }

keyDowns = (keyCode) -> 
  $(document).asEventStream("keydown").filter(keyCodeIs(keyCode))

keyUps = (keyCode) -> 
  $(document).asEventStream("keyup").filter(keyCodeIs(keyCode))

keyState = (keyCode, value) -> 
  keyDowns(keyCode).map(-> [value])
    .merge(keyUps(keyCode).map(-> [])).toProperty([])
~~~

TODO
- make test page work
- side-effect assignment for actual values only (what method name?)
- update readme
