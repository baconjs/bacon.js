functionsignature = n:new? c:identifier m:method? p:params? r:typeDefinition? {
  return {
    n: !!n,
    namespace: c,
    method: m,
    params: p,
    result: r,
  };
}

// tokens
whitespace = [ \t]+
identifier = x:[a-zA-Z_$] xs:[a-zA-Z0-9_$]* { return [x].concat(xs).join(""); }
ob = "(" whitespace?
cb = ")" whitespace?
os = "[" whitespace?
cs = "]" whitespace?

// Method signature
method = "." fn:identifier { return fn; }

new = "new" whitespace { return "new" }

params
  = ob cb { return []; }
  / ob "[" whitespace? p:param cs cb { return [p]; }
  / "(" p:firstparam r:rparams cb { return [p].concat(r); }

rparams = restparam*

restparam = restparamMandatory / restparamOptional
restparamOptional = "[" whitespace? p:restparamMandatory cs {
  p.optional = true;
  return p;
}
restparamMandatory = "," whitespace? p:param { return p; }

firstparam = param / thisparam

param = i:identifier whitespace? t:typeDefinition? r:("...")? whitespace? {
  return {
     name: i,
     type: t,
     splat: !!r,
  };
}

thisparam = "@" whitespace? t:typeDefinition {
  return {
    name: "@",
    type: t,
  };
}

// Type
typeDefinition = ":" whitespace? t:type { return t; }

type = functionType / scalarType / unitType

unitType = "()" {
  return {
     type: "unit",
  };
}

scalarType = alternativeType / scalarFunction
scalarFunction = ob t:functionType cb { return t; }

alternativeType
  = x:variableType xs:alternativeRest {
    if (xs.length === 0) {
      return x;
    } else {
      return {
       type: "sum",
         options: [x].concat(xs),
      };
    }
  }

alternativeRest = ("|" whitespace? v:variableType { return v; })*

variableType = i:identifier whitespace? p:typeParameters? {
  return {
    type: "name",
    name: i,
    params: p ? [p] : []
  };
}

functionType
  = x:scalarType? xs:("->" whitespace? y:scalarType? { return y; })+ { return {
      type: "function",
      ret: xs.slice(-1)[0]
    };}

typeParameters = os t:type cs { return t; }
