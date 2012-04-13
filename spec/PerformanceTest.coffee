Bacon = (require "../src/Bacon").Bacon

src = new Bacon.Bus()
out = src
  .map((x) -> x * 2)
  .filter((x) -> x % 2 == 0)
  .merge(
    src
  )
out.onValue((x) -> )
for num in [1..10000]
  src.push(num)
