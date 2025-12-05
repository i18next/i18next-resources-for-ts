const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const swc = require('@swc/core')

const parsers = {
  '.json': JSON.parse,
  '.yml': YAML.parse,
  '.yaml': YAML.parse
}

const scriptExtensions = ['.js', '.ts', '.mts', '.cts', '.cjs', '.mjs']
const supportedExtensions = [...Object.keys(parsers), ...scriptExtensions]

const getFiles = (srcpath) => {
  return fs.readdirSync(srcpath).filter((file) => {
    return !fs.statSync(path.join(srcpath, file)).isDirectory()
  }).filter((file) => supportedExtensions.includes(path.extname(file))).map((file) => path.join(srcpath, file))
}

const getDirectories = (srcpath) => {
  return fs.readdirSync(srcpath).filter((file) => {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
  }).map((dir) => path.join(srcpath, dir))
}

function getAllFiles (srcpath) {
  let files = getFiles(srcpath)
  const dirs = getDirectories(srcpath)
  dirs.forEach((dir) => {
    files = files.concat(getAllFiles(dir))
  })
  return files
}

module.exports = (p) => {
  const allFiles = getAllFiles(p)

  return allFiles.map((file) => {
    const ext = path.extname(file)
    let namespace

    if (parsers[ext]) {
      namespace = parsers[ext](fs.readFileSync(file, 'utf-8'))
    } else {
      try {
        if (['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'].includes(ext)) {
          const content = fs.readFileSync(file, 'utf8')
          const { code } = swc.transformSync(content, {
            filename: file,
            jsc: {
              parser: { syntax: 'typescript' },
              target: 'es2019'
            },
            module: { type: 'commonjs' }
          })

          const Module = require('module')
          const m = new Module(file, module.parent)
          m.filename = file
          m.paths = Module._nodeModulePaths(path.dirname(file))
          m._compile(code, file)
          namespace = m.exports
        } else {
          const resolved = require.resolve(file)
          delete require.cache[resolved]
          namespace = require(resolved)
        }

        if (namespace && namespace.default) namespace = namespace.default
      } catch (err) {
        console.error(`Failed to load ${file}:`, err.message)
        return null
      }
    }

    const sepFile = file.split(path.sep)
    const fileName = sepFile[sepFile.length - 1]
    const name = path.parse(fileName).name

    return {
      name,
      path: file,
      resources: namespace
    }
  }).filter(Boolean)
}
