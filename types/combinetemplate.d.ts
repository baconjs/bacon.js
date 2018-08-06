import { Property } from "./observable";
/**
 Combines Properties, EventStreams and constant values using a template
 object. For instance, assuming you've got streams or properties named
 `password`, `username`, `firstname` and `lastname`, you can do

 ```js
 var password, username, firstname, lastname; // <- properties or streams
 var loginInfo = Bacon.combineTemplate({
    magicNumber: 3,
    userid: username,
    passwd: password,
    name: { first: firstname, last: lastname }})
 ```

 .. and your new loginInfo property will combine values from all these
 streams using that template, whenever any of the streams/properties
 get a new value. For instance, it could yield a value such as

 ```js
 { magicNumber: 3,
   userid: "juha",
   passwd: "easy",
   name : { first: "juha", last: "paananen" }}
 ```

 In addition to combining data from streams, you can include constant
 values in your templates.

 Note that all Bacon.combine* methods produce a Property instead of an EventStream.
 If you need the result as an [`EventStream`](classes/eventstream.html) you might want to use [`property.changes()`](classes/property.html#changes)

 ```js
 Bacon.combineWith(function(v1,v2) { .. }, stream1, stream2).changes()
 ```
 */
export default function combineTemplate(template: any): Property<any>;
