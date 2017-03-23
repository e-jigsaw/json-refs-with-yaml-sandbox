const {resolve} = require('path')
const {readFileSync} = require('fs')
const {resolveRefs} = require('json-refs')
const {safeLoad, safeDump} = require('js-yaml')

const process = obj => Object.keys(obj).reduce((prev, key) => {
  if (typeof obj[key] === 'object') {
    prev[key] = process(obj[key])
  }
  if (key === '$extend') {
    const o = safeLoad(
      readFileSync(resolve(global.process.cwd(), obj[key])).toString()
    )
    prev = Object.keys(o).reduce((p, k) => {
      p[k] = o[k]
      return p
    }, prev)
  } else {
    prev[key] = obj[key]
  }
  return prev
}, {})

const load = str => process(safeLoad(str))

const main = async () => {
  const defs = safeLoad(readFileSync('definitions.yaml').toString())
  const tmp = await resolveRefs(
    load(readFileSync('index.yaml').toString()), {
    loaderOptions: {
      processContent: ({text}, next) => next(null, load(text))
    }
  })
  const tmp1 = JSON.parse(
    JSON.stringify(tmp.resolved).replace(
      /\{\{([\w]*)\}\}/g, (_, p) => defs[p]
    )
  )
  console.log(safeDump(tmp1))
}

main()
