# build-dependencies: filter
Observable :: errors = -> withDesc(new Bacon.Desc(this, "errors", []), @filter(-> false))
