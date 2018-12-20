export function symbol(key: string): any {
  if (typeof Symbol !== "undefined" && (<any>Symbol)[key]) {
    return (<any>Symbol)[key];
  } else if (typeof Symbol !== "undefined" && typeof (<any>Symbol).for === "function") {
    return (<any>Symbol)[key] = (<any>Symbol).for(key);
  } else {
    return "@@" + key;
  }
}
