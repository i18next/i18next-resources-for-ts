function trim (arr, startOnly) {
  let start = 0
  for (; start < arr.length; start++) {
    if (arr[start] !== '') break
  }

  let end = arr.length - 1
  for (; end >= 0; end--) {
    if (arr[end] !== '') break
  }

  if (start > end) return []
  if (startOnly) return arr.slice(start)
  return arr.slice(start, end)
}

const pathSeparatorWin = '\\'
const pathSeparator = '/'

function relative (from, to) {
  let separatorInFileContent = pathSeparator
  let separator = pathSeparator
  const seemsWindowsPath = from.indexOf(pathSeparatorWin) > -1 || to.indexOf(pathSeparatorWin) > -1
  if (seemsWindowsPath) {
    separator = pathSeparatorWin
  }

  if (from.endsWith(separator)) from = from.substring(0, from.length - separator.length)

  const toParts = trim(to.split(separator), true)

  const splittedFrom = from.split(separator)
  const lowerFromParts = trim(splittedFrom, from.indexOf('.') < 0)
  const splittedTo = to.split(separator)
  const lowerToParts = trim(splittedTo, true)

  const length = Math.min(lowerFromParts.length, lowerToParts.length)
  let samePartsLength = length

  for (let i = 0; i < length; i++) {
    if (lowerFromParts[i] !== lowerToParts[i]) {
      samePartsLength = i
      break
    }
  }

  if (samePartsLength === 0) return to

  let outputParts = []
  for (let i = samePartsLength; i < lowerFromParts.length; i++) {
    outputParts.push('..')
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength))

  if (seemsWindowsPath && outputParts[2] === ':') {
    separatorInFileContent = pathSeparatorWin
  }

  let ret = outputParts.join(separatorInFileContent)
  if (!ret.startsWith(from.substring(0, 2)) && !ret.startsWith('.')) {
    ret = `.${separatorInFileContent}${ret}`
  }

  return ret
}

export default relative
