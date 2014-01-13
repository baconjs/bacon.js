# A pruned version of BaconSpec, just to see if it runs nicer in Testling.CI
try
  expect = require("chai").expect
catch error
  console.log error

describe "Just testing", ->
  it "should always work", ->
    console.log "hooray"
