import defaults from './defaults.js'
import relative from './relative.js'

function tocForResources (namespaces, toPath, options = {}) {
  const opt = { ...options, ...defaults }
  const quoteChar = opt.quotes === 'single' ? '\'' : '"'

  let toc = ''

  namespaces.forEach((ns) => {
    toc += `import ${ns.name} from ${quoteChar}${relative(toPath, ns.path)}${quoteChar};\n`
  })

  toc += '\nexport default {'
  namespaces.forEach((ns, i) => {
    toc += `\n  ${ns.name}`
    if (i < namespaces.length - 1) {
      toc += ','
    }
  })
  toc += '\n}\n'

  return toc
}

export default tocForResources
