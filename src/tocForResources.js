import defaults from './defaults.js'
import relative from './relative.js'

function getVarName (name) {
  if (name.indexOf('-') > 0 || name.indexOf(' ') > 0) {
    return name.replace(/[- ]/g, '')
  }
  return name
}

function tocForResources (namespaces, toPath, options = {}) {
  const opt = { ...options, ...defaults }
  const quoteChar = opt.quotes === 'single' ? '\'' : '"'

  let toc = ''

  namespaces.forEach((ns) => {
    const nameToUse = getVarName(ns.name)
    if (ns.tsPath) {
      toc += `import ${nameToUse} from ${quoteChar}${relative(toPath, ns.tsPath.replace('.ts', ''))}${quoteChar};\n`
    } else {
      toc += `import ${nameToUse} from ${quoteChar}${relative(toPath, ns.path)}${quoteChar};\n`
    }
  })

  toc += '\nconst resources = {'
  namespaces.forEach((ns, i) => {
    const nameToUse = getVarName(ns.name)
    if (nameToUse !== ns.name) {
      toc += `\n  ${quoteChar}${ns.name}${quoteChar}: ${nameToUse}`
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
