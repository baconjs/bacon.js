import { expect } from "chai";

interface MockFunction {
  (...args: string[]): any,
  verify: Function,
  doReturn: Function
}

interface MockReturn {
  args: string[],
  returnValue: any
}

class Mock {
  methodNames: string[] = [];
  mockFuncs: { [methodName: string]: MockFunction } = {};

  constructor(...methodNames: string[]) { 
    for (const name of methodNames) {
      this.mockFuncs.name = mockFunction(name);
    }
  }

  verify() {
    const verifier: { [methodName: string]: Function } = {};
    for (const name of this.methodNames) {
      verifier[name] = this.mockFuncs[name].verify;
    }
    return verifier;
  }

  when() {
    const returner: { [methodName: string]: Function } = {};
    const assign = (name: string) => {
      returner[name] = (...args: string[]) => {
        return {
          thenReturn: (returnValue: any) => {
            return this.mockFuncs[name].doReturn(returnValue).when(...(args || []));
          }
        };
      };
    }
    for (const name of this.methodNames) {
      assign(name);
    }
    return returner;
  }
}

export const mockFunction = (name: string = "mockFunction"): MockFunction => {
  const calls: string[][] = [];
  const returns: MockReturn[] = [];
  const method = <MockFunction>function (...args: string[]): any {
    calls.push(args);
    for (let returnCombo of returns) {
      //console.log("check #{args} against #{name}(#{returnCombo.args})")
      if (eq(returnCombo.args, args)) { 
        //console.log("match => #{returnCombo.returnValue}")
        return returnCombo.returnValue;
      }
    }
    return undefined
  };
  method.verify = function(...args: string[]) {
    console.log("calls.length: " + calls.length)
    if (!calls.length) {
      throw `not called: ${name}`;
    }
    const actualCall = calls[0];
    calls.splice(0,1);
    return expect(actualCall).to.deep.equal(args);
  };
  method.doReturn = (returnValue: any) =>
    ({
      when(...args: string[]) {
        //console.log("#{name}(#{args}) => #{returnValue}")
        return returns.push({ args, returnValue});
      }
    })
  ;
  return method;
};

const eq = (xs: any[], ys: any[]): boolean => {
  if (xs.length !== ys.length) {
    return false;
  } 
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    if (x !== ys[i]) { 
      return false;
    }
  } 
  return true;
};

export const mock = (...methodNames: string[]) => new Mock(...methodNames || []);
