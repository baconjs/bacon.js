import { Desc } from "./describe";
import Observable from "./observable";

Observable.prototype.flatMapEvent = function(f) {
    return this.flatMap_(
        f,
        {
            mapError: true,
            desc: new Desc(this, "flatMapEvent", arguments)
        }
    )
};
