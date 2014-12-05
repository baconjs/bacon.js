
#console.log(file);
#console.log(path.resolve(path.dirname(file), '../ie8', path.basename(file)));
replaceLine = (line, assertStream) ->
  match = undefined
  line += "\n"
  expectPatterns.forEach (expectPattern) ->
    lineMatches = line.match(expectPattern)
    if lineMatches and lineMatches.length >= 3
      if ExpectToAssertMapper[lineMatches[2]]
        assertString = ExpectToAssertMapper[lineMatches[2]].replace(actualPattern, lineMatches[1]).replace(expectedPattern, lineMatches[3])
        line = line.replace(expectPattern, assertString)
        lineMatches = null

      #console.log(lineNum +"++"+ line);
      else

        # No matching API found replace with empty line
        line = "\n"


  assertStream.write line
  return
fs = require("fs")
path = require("path")
split = require("split")
coffeeify = require("coffeeify")
requirePattern = /expect\s+\=\s+require\(.*chai.*\)\.expect/
requirePatternReplacement = "assert = require(\"assertive-chai\").assert\n"
expectPatterns = [
  /expect\((.*)\)\.to\.(.*?)\((.*)\)/
  /expect\((.*)\).to.(.*)/
]
actualPattern = /actualPat/g
expectedPattern = /expectedPat/g
module.exports = (options) ->
  options.files.forEach (file, index) ->
    fileInputStream = fs.createReadStream(file)
    fileOutputStream = fs.createWriteStream(path.resolve(path.dirname(file), options.destDir, path.basename(file)))
    requireReplaced = undefined
    fileMatches = undefined
    fileInputStream.pipe(coffeeify()).pipe(split()).on "data", (line) ->
      if not requireReplaced and requirePattern.exec(line)
        requireReplaced = line.replace(requirePattern, requirePatternReplacement)
        console.log requireReplaced
        fileOutputStream.write requireReplaced
      else
        replaceLine line, fileOutputStream
      return

    fileInputStream.on "end", ->
      fileOutputStream.end()
      return

    return

  return

ExpectToAssertMapper =

  # match
  match: "assert.match actualPat, expectedPat"

  # include
  include: "assert.include actualPat, expectedPat"
  "include.keys": "assert.property actualPat, expectedPat"
  "include.members": "assert.includeMembers actualPat, expectedPat"
  "to.not.include.members": 'undefined'

  # contain
  contain: "assert.include actualPat, expectedPat"
  "contain.keys": "obj = actualPat
expectedPat.forEach (key) ->
  obj.hasownProperty key
  return
"

  # To be
  "be.a": "assert.typeOf actualPat, expectedPat"
  "be.an": "assert.typeOf actualPat, expectedPat"
  "be.instanceof": "assert.instanceof actualPat, expectedPat"
  "be.an.instanceof": "assert.instanceof actualPat, expectedPat"
  "be.above": "assert actualPat > expectedPat"
  "be.below": "assert actualPat < expectedPat"
  "be.at.least": "assert actualPat >= expectedPat"
  "be.at.most": "assert actualPat <= expectedPat"
  "be.within": 'undefined'
  "be.false": "assert.isFalse actualPat"
  "be.true": "assert.isTrue actualPat"

  # Equal
  equal: "assert.equal actualPat, expectedPat"
  eql: "assert.deepEqual actualPat, expectedPat"
  "deep.equal": "assert.deepEqual actualPat, expectedPat"
  "not.equal": "assert.notEqual actualPat, expectedPat"

  # Satisfy
  "to.satisfy": 'undefined'

  # CloseTo - not parsed correctly
  "to.be.closeTo": 'undefined'

  # Respond to
  "to.respondTo": 'undefined'

  # Itself Respond To
  "itself.to.respondTo": 'undefined'
  "itself.not.to.respondTo": 'undefined'

  # throws
  throw: "assert.throws actualPat, expectedPat"
  "not.throw": "assert.doesNotThrow actualPat, expectedPat"
  "to[\"throw\"]": 'undefined' # only dot notation supported

  # have
  "have.length": "assert.lengthOf actualPat, expectedPat"
  "have.length.above": "assert actualPat.length > expectedPat"
  "have.length.below": "assert actualPat.length < expectedPat"
  "have.length.of.at.least": "assert actualPat.length >= expectedPat)"
  "have.length.of.at.most": "assert(actualPat.length <= expectedPat"
  "to.have.length.within": 'undefined'
  "have.property": "assert.property actualPat, expectedPat"
  "have.deep.property": "assert.deepProperty actualPat, expectedPat"
  "have.ownProperty": "x = actualPat
assert x.hasownProperty(expectedPat)"
  "have.string": "assert.include actualPat, expectedPat"
  "have.keys": "expectedPat.forEach (key) ->
  assert.property actualPat, key
  return
"
  "have.members": "expectedPat.forEach (key) ->
  assert.include actualPat, key
  return
"
  "to.not.have.members": 'undefined'