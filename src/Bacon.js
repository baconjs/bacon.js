import _ from "./helpers/helpers";
import "./classes/EventStream";
import "./classes/Property";
import "./classes/Observable";
import "./classes/Bus";
import "./classes/Initial";
import "./classes/End";
import "./classes/Error";

var version = "<version>",
  toString = "Bacon";

export {
  // Classes
  EventStream,
  Property,
  Observable,
  Bus,
  Initial,
  Next,
  End,
  Error,
  // Helpers
  version,
  toString,
  _
};