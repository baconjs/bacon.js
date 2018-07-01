import _ from './_';
import { Event, Next, Initial, Error, End } from './event';
import { noMore, more } from './reply';
import spy from './spy';
import { Desc } from './describe';

import Scheduler from './scheduler';
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
  setScheduler: (newScheduler) => Scheduler.scheduler = newScheduler,
  getScheduler: () => Scheduler.scheduler,
  CompositeUnsubscribe,
  version: '<version>'
};

Bacon.Bacon = Bacon;
export default Bacon;
