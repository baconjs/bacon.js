import { Desc } from "./describe";
import Observable from "./observable";
import flatMap_ from "./flatmap_"

Observable.prototype.flatMapEvent = function(f) {
    return flatMap_(
        f,
        this,
        {
            mapError: true,
            desc: new Desc(this, "flatMapEvent", arguments)
        }
    )
};
