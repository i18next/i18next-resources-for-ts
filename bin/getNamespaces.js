import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import swc from '@swc/core'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

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

// Helper function to dynamically import a module
async function dynamicImport (filePath) {
  try {
    const ext = path.extname(filePath)

    // For JSON and YAML files, we can parse them directly
    if (parsers[ext]) {
      return parsers[ext](fs.readFileSync(filePath, 'utf-8'))
    }

    // For JavaScript/TypeScript files, we need to compile them first
    if (['.ts', '.mts', '.cts', '.js', '.mjs'].includes(ext)) {
      const content = fs.readFileSync(filePath, 'utf8')
      const { code } = swc.transformSync(content, {
        filename: filePath,
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2019'
        },
        module: { type: 'es6' }
      })

      // Write compiled code to a temporary file and import it
      const tempDir = path.join(process.cwd(), '.temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir)
      }

      const tempFilePath = path.join(tempDir, `${Date.now()}_${path.basename(filePath)}.js`)
      fs.writeFileSync(tempFilePath, code)

      try {
        // Import the compiled module
        const module = await import(tempFilePath)
        const namespace = module.default || module

        // Clean up temp file
        fs.unlinkSync(tempFilePath)

        return namespace
      } catch (err) {
        // Clean up temp file even if import fails
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
        throw err
      }
    }

    // For CommonJS files (.cjs), use require
    if (ext === '.cjs') {
      const resolved = require.resolve(filePath)
      // Clear cache to ensure fresh load
      delete require.cache[resolved]
      return require(resolved)
    }

    // For other file types, try to import them directly
    return await import(filePath)
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err.message)
    return null
  }
}

export default async (p) => {
  const allFiles = getAllFiles(p)

  const results = []
  for (const file of allFiles) {
    try {
      const namespace = await dynamicImport(file)

      if (namespace === null) {
        continue
      }

      const sepFile = file.split(path.sep)
      const fileName = sepFile[sepFile.length - 1]
      const name = path.parse(fileName).name

      results.push({
        name,
        path: file,
        resources: namespace
      })
    } catch (err) {
      console.error(`Failed to process ${file}:`, err.message)
    }
  }

  // Clean up temp directory if it exists
  const tempDir = path.join(process.cwd(), '.temp')
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }

  return results.filter(Boolean)
}
