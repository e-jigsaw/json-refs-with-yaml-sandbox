const {readFileSync} = require('fs')
const {resolveRefs} = require('json-refs')
const {safeLoad, safeDump} = require('js-yaml')

const main = async () => {
  const defs = safeLoad(readFileSync('definitions.yaml').toString())
  const tmp = await resolveRefs(safeLoad(readFileSync('index.yaml').toString()), {
    loaderOptions: {
      processContent: ({text}, next) => next(null, safeLoad(text))
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
