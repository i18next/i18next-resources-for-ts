import mergeResources from './mergeResources.js'

function mergeResourcesAsInterface (namespaces) {
  const resources = mergeResources(namespaces)
  let interfaceFileContent = 'interface Resources '
  interfaceFileContent += JSON.stringify(resources, null, 2)
  interfaceFileContent += '\n\nexport default Resources;\n'
  return interfaceFileContent
}

export default mergeResourcesAsInterface
