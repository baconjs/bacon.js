import _ from './_';
import { End, Error, Event, Initial, Next } from './event';
import { more, noMore } from './reply';
import spy from './spy';
import { Desc } from './describe';
import Scheduler from './scheduler';
import CompositeUnsubscribe from "./compositeunsubscribe";
import Bus from "./bus";
import once from "./once";
import retry from "./retry";
import never from "./never";
import { combineAsArray, combineWith } from "./combine";
import { fromCallback, fromNodeCallback } from "./callback";
import combineTemplate from "./combinetemplate";
import { concatAll } from "./concat";
import constant from "./constant";
import fromArray from "./fromarray";
import fromBinder from "./frombinder";
import fromESObservable from "./fromesobservable";
import fromEventTarget from "./fromevent";
import fromPoll from "./frompoll";
import fromPromise from "./frompromise";
import groupSimultaneous from "./groupsimultaneous";
import { interval } from "./interval";
import { B$ } from "./jquery";
import later from "./later";
import { mergeAll } from "./merge";
import { onValues } from "./onvalues";
import repeat from "./repeat";
import repeatedly from "./repeatedly";
import sequentially from "./sequentially";
import silence from "./silence";
import tryF from "./try";
import update from "./update";
import when from "./when";
import { zipAsArray, zipWith } from "./zip";
import { EventStream, default as Observable } from "./observable";
import UpdateBarrier from "./updatebarrier"
import "./esobservable";

const Bacon = {
  _,
  $: B$,
  Bus: Bus,
  CompositeUnsubscribe,
  Desc,
  End,
  Error,
  Event,
  EventStream,
  Initial,
  Next,
  Observable,
  UpdateBarrier,
  combineAsArray,
  combineTemplate,
  combineWith,
  concatAll,
  constant,
  fromArray,
  fromBinder,
  fromCallback,
  fromESObservable,
  fromEvent: fromEventTarget,
  fromEventTarget,
  fromNodeCallback,
  fromPoll,
  fromPromise,
  getScheduler: () => Scheduler.scheduler,
  groupSimultaneous,
  interval,
  later,
  mergeAll,
  more,
  never,
  noMore,
  onValues,
  once,
  repeat,
  repeatedly,
  retry,
  sequentially,
  setScheduler: (newScheduler) => Scheduler.scheduler = newScheduler,
  silence,
  spy,
  toString() { return "Bacon"; },
  try: tryF,
  update,
  version: '<version>',
  when,
  zipAsArray,
  zipWith
};

(<any>Bacon).Bacon = Bacon;

export default Bacon;