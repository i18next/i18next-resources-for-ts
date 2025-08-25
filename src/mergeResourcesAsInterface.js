import mergeResources from './mergeResources.js'

function mergeResourcesAsInterface(namespaces, options = {}) {
  let resources = mergeResources(namespaces)
  let interfaceFileContent = 'interface Resources '

  if (options.optimize) {
    resources = groupPluralKeys(Object.entries(resources), options)
  }
  console.dir(resources, {depth: null})

  interfaceFileContent += JSON.stringify(resources, null, 2)
  interfaceFileContent += '\n\nexport default Resources;\n'
  return interfaceFileContent
}

const isPluralKey = (key, {pluralSeparator = defaultOptions.pluralSeparator}) => pluralSuffixes
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

export function rmPluralization(entry, options) {
  if (!isPluralEntry(options)(entry)) return null
  else {
    const [key] = entry
    const index = key.lastIndexOf(options.pluralSeparator ?? defaultOptions.pluralSeparator)
    return key.slice(0, index)
  }
}

export function groupPluralKeys(entries, options) {
  if (typeof entries === "string") return entries
  console.dir(entries.map(it => it[0]).join(", "))
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
        acc[k] = [v]
        return acc
      }
      const depluralized = maybe
      if (depluralized in acc) {
        const existing = acc[depluralized]
        acc[depluralized] = [...existing, v]
        return acc
      } else {
        acc[depluralized] = [v]
        return acc
      }
    },
    {}
  )
}

export default mergeResourcesAsInterface
