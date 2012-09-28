class Mock
  constructor: (methodNames...) -> 
    for name in methodNames
      this[name] = mockFunction(name)
    this.verify = () =>
      verifier = {}
      for name in methodNames
        verifier[name] = this[name].verify
      verifier

mockFunction = (name) ->
  calls = []
  method = (args...) =>
    calls.push(args)
  method.verify = (args...) ->
    if !calls
      throw "not called: #{name}"
    actualCall = calls[0]
    calls.splice(0,1)
    expect(actualCall).toEqual(args)
  method

@mock = (methodNames...) -> new Mock(methodNames...)
