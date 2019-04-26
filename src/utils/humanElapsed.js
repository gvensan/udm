module.exports = (int) => {
  const ranges = {
    day: 60 * 60 * 24,
    hour: 60 * 60,
    minute: 60,
    second: 1
  }
  const time = Object.keys(ranges)
    .map(key => ranges[key])
    .reduce((acum, range) => {
      const latest = acum[acum.length -1]
      acum.push({
        int: Math.floor(latest.res / range),
        res: latest.res % range
      })
      return acum
    }, [{ int:0, res:parseInt(int, 10) }])
    .filter((e, i) => i !== 0)
    .map((range, index) => {
      const base = Object.keys(ranges)[index]
      const unit = range.int !== 1 ? `${base}s` : base
      return {
        unit,
        value: range.int
      }
    })
    .filter(e => e.value > 0)
    .map(e => `${e.value} ${e.unit}`)
    .join(' ')

  return time
}
