import defaults from './defaults.js'
import relative from './relative.js'

// paths and names come from the file system, so they must never reach the
// generated source unescaped (GHSA-xfhx-x4r4-x799)
function getVarName (name) {
  return name
    .replace(/[- ]/g, '')
    .replace(/[^\p{ID_Continue}$]/gu, '_')
    .replace(/^(?![\p{ID_Start}$_])/u, '_')
}

function quote (str, quoteChar) {
  const json = JSON.stringify(str)
  if (quoteChar === '"') return json
  return `'${json.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, '\\\'')}'`
}

function tocForResources (namespaces, toPath, options = {}) {
  const opt = { ...defaults, ...options }
  const quoteChar = opt.quotes === 'single' ? '\'' : '"'

  let toc = ''

  namespaces.forEach((ns) => {
    const nameToUse = getVarName(ns.name)
    const importPath = ns.tsPath ? relative(toPath, ns.tsPath.replace('.ts', '')) : relative(toPath, ns.path)
    toc += `import ${nameToUse} from ${quote(importPath, quoteChar)};\n`
  })

  toc += '\nconst resources = {'
  namespaces.forEach((ns, i) => {
    const nameToUse = getVarName(ns.name)
    if (nameToUse !== ns.name) {
      toc += `\n  ${quote(ns.name, quoteChar)}: ${nameToUse}`
    } else {
      toc += `\n  ${ns.name}`
    }
    if (i < namespaces.length - 1) {
      toc += ','
    }
  })
  toc += '\n} as const;\n'

  toc += '\nexport default resources;\n'

  return toc
}

export default tocForResources
