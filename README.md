bacon.js
========

A small reactive programming lib for js.

~~~ coffeescript
keyCodeIs = (keyCode) -> { event -> event.keyCode == keyCode }

keyDowns = (keyCode) -> 
  $(document).eventStream("keydown").filter(keyCodeIs(keyCode))

keyUps = (keyCode) -> 
  $(document).eventStream("keyup").filter(keyCodeIs(keyCode))

keyState = (keyCode, value) -> 
  keyDowns(keyCode).map(-> [value])
    .merge(keyUps(keyCode).map(-> [])).toProperty([])
~~~
