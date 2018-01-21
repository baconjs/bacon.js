import { makeSpawner, handleEventValueWith } from "./flatmap_"
import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.flatMapEvent = function() {
    return this.flatMap_(
        makeSpawner(arguments), 
        {
            mapError: true,
            desc: new Desc(this, "flatMapEvent", arguments)
        }
    )
};
