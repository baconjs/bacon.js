# build-dependencies: combinetemplate

Bacon.Observable :: decode = (cases) -> withDesc(new Bacon.Desc(this, "decode", [cases]), @combine(Bacon.combineTemplate(cases), (key, values) -> values[key]))
