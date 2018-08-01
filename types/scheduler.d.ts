export interface Scheduler {
    setTimeout(f: Function, d: number): number;
    setInterval(f: Function, i: number): number;
    clearInterval(id: number): any;
    clearTimeout(id: number): any;
    now(): number;
}
/** @hidden */
export declare const defaultScheduler: Scheduler;
declare const GlobalScheduler: {
    scheduler: Scheduler;
};
export declare function getScheduler(): Scheduler;
export declare function setScheduler(newScheduler: Scheduler): void;
export default GlobalScheduler;
