// build-dependencies: _
// build-dependencies: helpers
// build-dependencies: event
// build-dependencies: reply
// build-dependencies: observable
// build-dependencies: eventstream
// build-dependencies: property
// build-dependencies: frombinder
// build-dependencies: describe
// build-dependencies: functionconstruction

import _ from './_';
import { Event, Next, Initial, Error, End } from './event';
import { noMore, more } from './reply';
import spy from './spy';
import { Desc } from './describe';
import UpdateBarrier from './updatebarrier';

import scheduler from './scheduler';
import Dispatcher from "./dispatcher";
import Observable from "./observable";
import EventStream from "./eventstream";
import Property from "./property";
import CompositeUnsubscribe from "./compositeunsubscribe";
import never from "./never";
import constant from "./constant";

var Bacon = {
  toString() { return "Bacon"; },
  _,
  Event,
  Next,
  Initial,
  Error,
  End,
  noMore,
  more,
  Desc,
  spy,
  UpdateBarrier,
  scheduler,
  Dispatcher,
  Observable,
  EventStream,
  Property,
  CompositeUnsubscribe,
  never,
  constant,
  version: '<version>'
};

Bacon.Bacon = Bacon;
export default Bacon;
