sinon = require 'sinon'
Bacon = require '../src/Bacon'
assert = require("assertive-chai").assert
$.fn.asEventStream = Bacon.$.asEventStream

elemName = (event) ->
  event.target.localName

describe 'asEventStream', ->
  it 'supports simple format', ->
    mock = sinon.spy()
    $('body').asEventStream('click').map(elemName).take(1).onValue(mock)
    $('body').click()
    assert.equal mock.callCount, 1
    assert.equal mock.firstCall.args[0], 'body'
  it 'supports jQuery live selector format', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body').map(elemName).take(1).onValue(mock)
    $('body').click()
    assert.equal mock.callCount, 1
    assert.equal mock.firstCall.args[0], 'body'
  it 'supports optional eventTransformer, with jQuery live selector', ->
    mock = sinon.spy()
    $('html').asEventStream('click', 'body', elemName).take(1).onValue(mock)
    $('body').click()
    assert.equal mock.callCount, 1
    assert.equal mock.firstCall.args[0], 'body'
  it 'supports optional eventTransformer, without jQuery live selector', ->
    mock = sinon.spy()
    $('body').asEventStream('click', elemName).take(1).onValue(mock)
    $('body').click()
    assert.equal mock.callCount, 1
    assert.equal mock.firstCall.args[0], 'body'
  it 'binds “this” to DOM element', ->
    mock = sinon.spy()
    $('body').asEventStream('click', mock).take(1).onValue(->)
    $('body').click()
    assert.isTrue mock.calledOn($('body')[0])


