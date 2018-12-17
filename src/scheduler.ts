export interface Scheduler {
  setTimeout(f: Function, d: number): number
  setInterval(f: Function, i: number): number
  clearInterval(id: number): any
  clearTimeout(id: number): any
  now(): number
}

/** @hidden */
export const defaultScheduler: Scheduler = {
  setTimeout(f,d) { return setTimeout(f,d); },
  setInterval(f, i) { return setInterval(f, i); },
  clearInterval(id) { return clearInterval(id); },
  clearTimeout(id) { return clearTimeout(id); },
  now() { return new Date().getTime(); }
}

const GlobalScheduler = {
  scheduler: defaultScheduler
}

export function getScheduler(): Scheduler {
  return  GlobalScheduler.scheduler
}

export function setScheduler(newScheduler: Scheduler) {
  GlobalScheduler.scheduler = newScheduler
}

export default GlobalScheduler
