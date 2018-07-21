### Why

Getting typechecking for the internals makes development more fun and safer too.

Also, will be great to get a fully and correctly type version of Bacon out!

### Changes

- Function Construction Rules are gone. No more `stream.map(".fieldName")`
- Tests are now always run against ../dist/Bacon.js which is a good thing. Makes sure the actual bundle is working.
- observable.last() only stores value events, passes through errors (I think this was a bug)
- added Bacon.silence(duration)
- Replaced `withHandler` with `transform`
- Observable argument support removed from `fromCallback` and `fromNodeCallback`

### Not so nice things

- I've had to resort to some `<any>` typings in, for example `EventStream.map` to
avoid code duplication between implementations for eventstreams and properties.
If TypeScript had higher-kinded types, this might be avoidable.


### TODO

- A lot of .js sources still there!
- The `npm run dist` thingie that uses Rollup currently hides typescript type errors.
As an interim solution there's `npm run watch-ts`
- Partial builds not working. Work not started. See below.
- jQuery "this" binding test failing.

### Design decisions

The earlier approach of adding methods to prototypes in different source files
doesn't work with Typescript. The new design is such that operations (like `map`) are 
defined in their own source files but included in the `Observable`, `EventStream` 
and `Property` classes by delegating to the implementations in the separate modules.
This allows library users to use Bacon.js just like before but also allows you to
require separate methods if you like. Partial builds are currently not possible, but
could be created by some preprocessing on the 3 files. 