import mergeResources from './mergeResources.js'

function mergeResourcesAsInterface (namespaces, options = {}) {
  let resources = mergeResources(namespaces)
  let interfaceFileContent = 'interface Resources '

  if (options.optimize) {
    resources = groupPluralKeys(Object.entries(resources), options)
  }

  interfaceFileContent += resourceToString(resources)
  interfaceFileContent += '\n\nexport default Resources;\n'
  return interfaceFileContent
}

function resourceToString (resources, indentation = 0) {
  const intend = '  '.repeat(indentation)
  if (typeof resources === 'string') return JSON.stringify(resources)
  if (Array.isArray(resources)) {
    return `[${resources.map(it => resourceToString(it)).join(', ')}]`
  }
  if (resources && '_tag' in resources && resources._tag === translationSymbol) {
    return resources.value.map(it => JSON.stringify(it)).join(' | ')
  }
  if (typeof resources === 'object' && resources !== null) {
    const entries = Object.entries(resources)
      .sort(([k1], [k2]) => { if (k1 < k2) return -1; if (k1 > k2) return 1; return 0 })
      .map(([k, v]) => {
        return `"${k.replace(/"/g, '\\"')}": ${resourceToString(v, indentation + 1)}`
      })
    return `{\n${entries.map(it => `${intend}  ${it}`).join(',\n')}\n${intend}}`
  }
}

const isPluralKey = (key, { pluralSeparator = defaultOptions.pluralSeparator }) => pluralSuffixes
  .map((suffix) => `${pluralSeparator}${suffix}`)
  .some((suffix) => key.endsWith(suffix))

export const defaultOptions = {
  pluralSeparator: '_'
}

export const pluralSuffixes = [
  'zero',
  'one',
  'two',
  'few',
  'many',
  'other'
]

const isPluralEntry = (options) => (entry) => isPluralKey(entry[0], options)

export function rmPluralization (entry, options) {
  if (!isPluralEntry(options)(entry)) return null
  else {
    const [key] = entry
    const index = key.lastIndexOf(options.pluralSeparator ?? defaultOptions.pluralSeparator)
    return key.slice(0, index)
  }
}

const translationSymbol = Symbol('is-translation')

export function groupPluralKeys (entries, options) {
  if (typeof entries === 'string') return entries

  if (entries.length === 0) return {}

  return entries.reduce(
    (acc, [k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        // Recursively group nested objects
        acc[k] = groupPluralKeys(Object.entries(v), options)
        return acc
      }
      if (Array.isArray(v)) {
        acc[k] = v.map(item => {
          if (typeof item === 'object' && item !== null) {
            return groupPluralKeys(Object.entries(item), options)
          }
          return item
        })
        return acc
      }
      const maybe = rmPluralization([k, v], options)
      if (maybe == null) {
        acc[k] = { _tag: translationSymbol, value: [v] }
        return acc
      }
      const depluralized = maybe
      if (depluralized in acc) {
        const existing = acc[depluralized]
        acc[depluralized] = { _tag: translationSymbol, value: [...existing.value, v] } // just use the existing one
        return acc
      } else {
        acc[depluralized] = { _tag: translationSymbol, value: [v] }
        return acc
      }
    },
    {}
  )
}

export default mergeResourcesAsInterface
