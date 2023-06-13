function json2ts (resources) {
  let tsContent = 'const ns = '
  tsContent += JSON.stringify(resources, null, 2)
  tsContent += ' as const;\n'
  tsContent += '\nexport default ns;\n'
  return tsContent
}

export default json2ts
