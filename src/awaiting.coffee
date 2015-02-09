# build-dependencies: observable, groupsimultaneous, skipduplicates, map

Bacon.Observable :: awaiting = (other) ->
  withDescription(this, "awaiting", other,
    Bacon.groupSimultaneous(this, other)
      .map(([myValues, otherValues]) -> otherValues.length == 0)
      .toProperty(false).skipDuplicates())

