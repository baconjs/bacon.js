bacon.js
========

A small reactive programming lib for js.

Inspired largely on RxJs, but includes the `EventStream` and `Property`
concepts from [reactive-bacon](https://github.com/raimohanska/reactive-bacon).

More docs and stuff coming up later.

~~~ coffeescript
        $("#clikme").asEventStream("click").subscribe(function(event) {
          alert("mmmm... bacon!")
        })

        function always(value) { return function() { return value }}
        
        function keyCodeIs(keyCode) { 
          return function(event) { return event.keyCode == keyCode }
        }

        function keyDowns(keyCode) { 
          return $(document).asEventStream("keydown").filter(keyCodeIs(keyCode))
        }

        function keyUps(keyCode) { 
          return $(document).asEventStream("keyup").filter(keyCodeIs(keyCode))
        }

        function keyState(keyCode) { 
          return keyDowns(keyCode).map(always("DOWN"))
            .merge(keyUps(keyCode).map(always("UP"))).toProperty("UP")
        }

        keyState(32).subscribe(function(state) {
          $("#state").text(state.value)
        })
~~~

build
=====

Build the coffeescript source into javascript:

    cake build

Result javascript file will be generated in `lib` directory.

test
====

Run unit tests:

    npm install&&npm test

contribute
==========

Use GitHub issues and Pull Requests.
