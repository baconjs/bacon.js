module.exports =
  coffee:
    files: "src/*.coffee"
    tasks: "build"

  next:
    files: "src/**/*.js"
    tasks: "next"

  readme:
    files: "readme-src.coffee"
    tasks: "readme"