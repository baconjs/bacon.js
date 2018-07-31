import "./filter";
import "./concat";
import Observable from "./observable";
export default function bufferingThrottle<V>(src: Observable<V>, minimumInterval: number): Observable<V>;
