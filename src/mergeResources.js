function mergeResources (namespaces) {
  return namespaces.reduce((prev, cur) => {
    prev[cur.name] = cur.resources
    return prev
  }, {})
}

export default mergeResources
