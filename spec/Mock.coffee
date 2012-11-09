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
      if checkMatch(returnCombo.args, args) 
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
        returns.push({ args: toMatchers(args), returnValue: returnValue})
    }
  method

toMatchers = (values) ->
  makeMatcher(value) for value in values

checkMatch = (matchers, ys) ->
  return false if (matchers.length != ys.length) 
  for matcher, i in matchers
    return false if (!matcher(ys[i])) 
  true

makeMatcher = (x) ->
  if (x? and x.isMatcher) then x else matchers.equal(x)

matcherFunction = (f) -> 
  f.isMatcher = true
  f

@mock = (methodNames...) -> new Mock(methodNames...)
@mockFunction = mockFunction

matchers = {
  any : matcherFunction(-> true)
  equal : (expected) -> matcherFunction((x) -> x == expected)
}

@matchers = matchers
