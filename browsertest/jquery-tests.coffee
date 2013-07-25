sinon = require 'sinon'
Bacon = require '../src/Bacon'
expect = require('chai').expect
$.fn.asEventStream = Bacon.$.asEventStream

elemName = (event) ->
  event.target.localName

describe 'asEventStream', ->
  it 'supports simple format', ->
    mock = sinon.spy()
    $('body').asEventStream('click').map(elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal('body')
  it 'supports jQuery live selector format', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body').map(elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal('body')
  it 'supports optional eventTransformer, with jQuery live selector', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body', elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal('body')
  it 'supports optional eventTransformer, without jQuery live selector', ->
    mock = sinon.spy()
    $('body').asEventStream('click', elemName).take(1).onValue(mock)
    $('body').click()
    expect(mock.callCount).to.equal(1)
    expect(mock.firstCall.args[0]).to.equal('body')

