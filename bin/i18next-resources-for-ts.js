#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const getNamespaces = require('./getNamespaces.js')
const {
  tocForResources,
  mergeResources,
  mergeResourcesAsInterface,
  json2ts
} = require('../')
const chokidar = require('chokidar')

const cliArgs = process.argv.slice(2)

const subCommands = [
  'toc',
  'merge',
  'interface'
]

if (cliArgs.length === 0 || subCommands.indexOf(cliArgs[0]) < 0) {
  throw new Error(`Please define an appropriate subcommand: ${subCommands.join(', ')}!`)
}

const subCommand = cliArgs[0]

let optimize = false
let inputPath = process.cwd()
let outputPath = inputPath
if (cliArgs.length > 0 && cliArgs[1].indexOf('-') !== 0) {
  inputPath = cliArgs[1]
  outputPath = inputPath
}
let comment

const inputArgIndex = cliArgs.indexOf('-i')
const outputArgIndex = cliArgs.indexOf('-o')
const commentArgIndex = cliArgs.indexOf('-c')
const optimizeArgIndex = cliArgs.indexOf('--optimize')
const watchArgIndex = cliArgs.indexOf('-w') > -1 || cliArgs.indexOf('--watch') > -1
if (inputArgIndex > -1 && cliArgs[inputArgIndex + 1]) inputPath = cliArgs[inputArgIndex + 1]
if (outputArgIndex > -1 && cliArgs[outputArgIndex + 1]) outputPath = cliArgs[outputArgIndex + 1]
if (commentArgIndex > -1 && cliArgs[commentArgIndex + 1]) comment = cliArgs[commentArgIndex + 1]
if (optimizeArgIndex > -1) optimize = true

inputPath = path.resolve(inputPath)
outputPath = path.resolve(outputPath)

const commentSection = comment ? `/**\n * ${comment}\n */\n` : ''

// helper to decide which file extensions are relevant for watching
const watchedExts = ['.json', '.yml', '.yaml', '.js', '.ts', '.mts', '.cts', '.cjs', '.mjs']

// compute some cli flags that affect behavior
const convertToTsFlag = cliArgs.indexOf('-cts') > 0
const delFlag = cliArgs.indexOf('-d') > 0

function runOnce () {
  const namespaces = getNamespaces(inputPath)

  if (subCommand === 'toc') {
    let outputFile = outputPath
    if (!outputFile.endsWith('.ts')) {
      outputFile = path.join(outputFile, 'resources.ts')
    }

    let nsToUse = namespaces
    const convertToTs = convertToTsFlag
    const del = delFlag
    if (convertToTs) {
      nsToUse = namespaces.map((n) => {
        n.ts = json2ts(n.resources)
        n.tsPath = n.path.replace('.json', '.ts')
        return n
      })
      nsToUse.forEach((n) => {
        fs.writeFileSync(n.tsPath, commentSection + n.ts, 'utf-8')
      })
    }

    const toc = tocForResources(nsToUse, outputFile)
    fs.writeFileSync(outputFile, commentSection + toc, 'utf-8')
    if (convertToTs && del) {
      nsToUse.forEach((n) => {
        fs.unlinkSync(n.path)
      })
    }
    console.log(`created toc resources file for ${nsToUse.length} ${convertToTs ? 'converted ts ' : ''}namespaces: ${outputFile}`)
  }

  if (subCommand === 'merge') {
    if (comment) console.warn('Comment is ignored for json file output.')
    const merged = mergeResources(namespaces)
    let outputFile = outputPath
    if (!outputFile.endsWith('.json')) {
      outputFile = path.join(outputFile, 'resources.json')
    }
    fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf-8')
    console.log(`created merged resources file for ${namespaces.length} namespaces: ${outputFile}`)
  }

  if (subCommand === 'interface') {
    let outputFile = outputPath
    if (!outputFile.endsWith('.ts')) {
      outputFile = path.join(outputFile, 'resources.d.ts')
    }
    const typeDefinitionFile = mergeResourcesAsInterface(namespaces, { optimize })
    fs.writeFileSync(outputFile, commentSection + typeDefinitionFile, 'utf-8')
    console.log(`created interface resources file for ${namespaces.length} namespaces: ${outputFile}`)
  }
}

if (!watchArgIndex) {
  // single run
  runOnce()
} else {
  // initial run
  runOnce()
  console.log(`watching ${inputPath} for changes... (extensions: ${watchedExts.join(', ')})`)

  // debounce to avoid multiple runs for a single save
  let timer = null
  try {
    // watch the whole inputPath, but don't ignore directories (so chokidar can watch recursively)
    // ignore dotfiles, node_modules and the outputPath (if it's inside the input tree)
    const ignoredPatterns = [ /(^|[/\\])\../, /node_modules/ ]
    if (outputPath.startsWith(inputPath)) ignoredPatterns.push(outputPath)

    const watcher = chokidar.watch(inputPath, {
      ignored: ignoredPatterns,
      ignoreInitial: true,
      persistent: true,
      depth: Infinity
    })

    watcher.on('all', (eventType, filename) => {
      if (!filename) return
      // sometimes chokidar emits directory events or paths without ext — only react to file paths with known extensions
      const ext = path.extname(filename)
      if (!ext || !watchedExts.includes(ext)) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          console.log(`[watch] detected ${eventType} on ${filename} — regenerating ${subCommand}...`)
          runOnce()
        } catch (err) {
          console.error('[watch] error while regenerating:', err)
        }
      }, 200)
    })
  } catch (err) {
    console.error('Failed to start file watcher.', err)
    process.exit(1)
  }
}
