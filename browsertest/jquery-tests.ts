import * as sinon from 'sinon';
import * as Bacon from '..';
import { expect } from 'chai';

declare var $: any;

Bacon.$.init($);

const elemName = (event: any) => event.target.localName;

describe('asEventStream', function() {
  it('supports simple format', function() {
    const mock = sinon.spy();
    $('body').asEventStream('click').map(elemName).take(1).onValue(mock);
    $('body').click();
    expect(mock.callCount).to.equal(1);
    return expect(mock.firstCall.args[0]).to.equal('body');
  });
  it('supports jQuery live selector format', function() {
    const mock = sinon.spy();
    $('html').asEventStream('click', 'body').map(elemName).take(1).onValue(mock);
    $('body').click();
    expect(mock.callCount).to.equal(1);
    return expect(mock.firstCall.args[0]).to.equal('body');
  });
  it('supports optional eventTransformer, with jQuery live selector', function() {
    const mock = sinon.spy();
    $('html').asEventStream('click', 'body', elemName).take(1).onValue(mock);
    $('body').click();
    expect(mock.callCount).to.equal(1);
    return expect(mock.firstCall.args[0]).to.equal('body');
  });
  it('supports optional eventTransformer, without jQuery live selector', function() {
    const mock = sinon.spy();
    $('body').asEventStream('click', elemName).take(1).onValue(mock);
    $('body').click();
    expect(mock.callCount).to.equal(1);
    return expect(mock.firstCall.args[0]).to.equal('body');
  });
  return it('binds “this” to DOM element', function() {
    const mock = sinon.spy();
    $('body').asEventStream('click', mock).take(1).onValue(function() {});
    $('body').click();
    // TODO: fails. not sure what this test is about actually.
    return expect(mock.calledOn($('body')[0])).to.be.true;
  });
});
