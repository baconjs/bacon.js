import * as Bacon from "..";
import { expect } from "chai";
import { expectStreamEvents, error } from "./util/SpecHelper";

describe("Bacon.fromCallback", () => {
  describe("makes an EventStream from function that takes a callback", () =>
    expectStreamEvents(
      () => {
        const src = (callback: Function) => callback("lol");
        return Bacon.fromCallback(src);
      },
      ["lol"])
  );
  describe("supports partial application", () =>
    expectStreamEvents(
      () => {
        const src = (param: any, callback: Function) => callback(param);
        return Bacon.fromCallback(src, "lol");
      },
      ["lol"])
  );
  describe("supports object, methodName, partial application", () =>
    expectStreamEvents(
      () => {
        const src: any = {
                "go": (param: any, callback: Function) => { return callback(param + " " + src.name); },
                "name": "bob"
              };
        return Bacon.fromCallback(src, "go", "hello");
      },
      ["hello bob"])
  );
  it("toString", () => expect(Bacon.fromCallback((() => {}), "lol").toString()).to.equal("Bacon.fromCallback(function,lol)"));
});

describe("Bacon.fromNodeCallback", () => {
  describe("makes an EventStream from function that takes a node-style callback", () =>
    expectStreamEvents(
      () => {
        const src = (callback: Function) => callback(null, "lol");
        return Bacon.fromNodeCallback(src);
      },
      ["lol"])
  );
  describe("handles error parameter correctly", () =>
    expectStreamEvents(
      () => {
        const src = (callback: Function) => callback('errortxt', null);
        return Bacon.fromNodeCallback(src);
      },
      [error()])
  );
  describe("supports partial application", () =>
    expectStreamEvents(
      () => {
        const src = (param: string, callback: Function) => callback(null, param);
        return Bacon.fromNodeCallback(src, "lol");
      },
      ["lol"])
  );
  describe("supports object, methodName, partial application", () =>
    expectStreamEvents(
      () => {
        const src: any = {
                "go": (param: any, callback: Function) => { return callback(null, param + " " + src.name); },
                "name": "bob"
              };
        return Bacon.fromNodeCallback(src, "go", "hello");
      },
      ["hello bob"])
  );
  it("toString", () => expect(Bacon.fromNodeCallback((() => {}), "lol").toString()).to.equal("Bacon.fromNodeCallback(function,lol)"));
});
