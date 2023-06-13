import defaults from './defaults.js'
import relative from './relative.js'

function tocForResources (namespaces, toPath, options = {}) {
  const opt = { ...options, ...defaults }
  const quoteChar = opt.quotes === 'single' ? '\'' : '"'

  let toc = ''

  namespaces.forEach((ns) => {
    if (ns.tsPath) {
      toc += `import ${ns.name} from ${quoteChar}${relative(toPath, ns.tsPath.replace('.ts', ''))}${quoteChar};\n`
    } else {
      toc += `import ${ns.name} from ${quoteChar}${relative(toPath, ns.path)}${quoteChar};\n`
    }
  })

  toc += '\nconst resources = {'
  namespaces.forEach((ns, i) => {
    toc += `\n  ${ns.name}`
    if (i < namespaces.length - 1) {
      toc += ','
    }
  })
  toc += '\n} as const;\n'

  toc += '\nexport default resources;\n'

  return toc
}

export default tocForResources
