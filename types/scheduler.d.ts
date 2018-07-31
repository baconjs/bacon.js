export declare type Scheduled = number;
export interface Scheduler {
    setTimeout(f: Function, d: number): Scheduled;
    setInterval(f: Function, i: number): Scheduled;
    clearInterval(id: Scheduled): any;
    clearTimeout(id: Scheduled): any;
    now(): number;
}
export declare const defaultScheduler: Scheduler;
declare const GlobalScheduler: {
    scheduler: Scheduler;
};
export declare function getScheduler(): Scheduler;
export declare function setScheduler(newScheduler: Scheduler): void;
export default GlobalScheduler;
