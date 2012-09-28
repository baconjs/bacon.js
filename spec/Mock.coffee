class Mock
  constructor: (methodNames...) -> 
    for name in methodNames
      this[name] = mockFunction(name)
    this.verify = () =>
      verifier = {}
      for name in methodNames
        verifier[name] = this[name].verify
      verifier
    this.when = () =>
      returner = {}
      methodNames.forEach (name) =>
        returner[name] = (args...) =>
          {
            thenReturn: (returnValue) =>
              this[name].return(returnValue).when(args...)
          }
      returner

mockFunction = (name) ->
  calls = []
  returns = []
  method = (args...) =>
    calls.push(args)
    for returnCombo in returns
      #console.log("check #{args} against #{name}(#{returnCombo.args})")
      if eq(returnCombo.args, args) 
        #console.log("match => #{returnCombo.returnValue}")
        return returnCombo.returnValue
  method.verify = (args...) ->
    if !calls
      throw "not called: #{name}"
    actualCall = calls[0]
    calls.splice(0,1)
    expect(actualCall).toEqual(args)
  method.return = (returnValue) ->
    {
      when: (args...) ->
        #console.log("#{name}(#{args}) => #{returnValue}")
        returns.push({ args: args, returnValue: returnValue})
    }
  method
eq = (xs, ys) ->
  return false if (xs.length != ys.length) 
  for x, i in xs
    return false if (x != ys[i]) 
  true
@mock = (methodNames...) -> new Mock(methodNames...)
@mockFunction = mockFunction
