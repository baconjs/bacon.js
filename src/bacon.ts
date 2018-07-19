import Bacon from "./core";

import "./observable"

import "./awaiting";
import "./groupsimultaneous";
import "./boolean";
import "./buffer";
import "./bufferingthrottle";
import "./bus";
import "./callback";
import "./constant";
import "./combine";
import "./combinetemplate";
import "./concat";
import "./debounce";
import "./decode";
import "./diff";
import "./doaction";
import "./doend";
import "./doerror";
import "./dolog";
import "./endonerror";
import "./event.ts";
import "./esobservable";
import "./filter";
import "./flatmap";
import "./flatmapevent";
import "./flatmapfirst";
import "./flatmaplatest";
import "./flatmapwithconcurrencylimit";
import "./flatmaperror";
import "./flatscan";
import "./fold";
import "./fromarray";
import './frombinder';
import './fromesobservable';
import './fromevent';
import './frompoll';
import "./frompromise";
import "./groupby";
import "./holdwhen";
import "./interval";
import "./jquery";
import "./last";
import "./later";
import "./log";
import "./map";
import "./mapend";
import "./maperror";
import "./merge";
import "./never";
import "./observable";
import "./once";
import "./onvalues";
import "./repeatedly";
import "./repeat";
import "./retry";
import "./sample";
import "./scan";
import "./sequentially";
import "./skip";
import "./skipduplicates";
import "./skiperrors";
import "./skipuntil";
import "./skipwhile";
import "./startwith";
import "./slidingwindow";
import "./take";
import "./takeuntil";
import "./takewhile";
import "./throttle";
import "./topromise";
import "./try";
import "./update";
import "./when";
import "./withstatemachine";
import "./withlatestfrom";
import "./zip";

import Observable, { EventStream, Property } from "./observable"
import UpdateBarrier from "./updatebarrier"

Bacon.EventStream = EventStream
Bacon.UpdateBarrier = UpdateBarrier
Bacon.Observable = Observable
Bacon.Property = Property

export default Bacon;