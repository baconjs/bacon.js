import _ from './_';
import { Event, Next, Initial, Error, End } from './event';
import { noMore, more } from './reply';
import spy from './spy';
import { Desc } from './describe';

import scheduler from './scheduler';
import Dispatcher from "./dispatcher";
import CompositeUnsubscribe from "./compositeunsubscribe";

const Bacon = {
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
  scheduler,
  CompositeUnsubscribe,
  version: '<version>'
};

Bacon.Bacon = Bacon;
export default Bacon;
