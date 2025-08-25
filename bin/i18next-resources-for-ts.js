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
const optimizeArgIndex = cliArgs.indexOf("--optimize")
if (inputArgIndex > -1 && cliArgs[inputArgIndex + 1]) inputPath = cliArgs[inputArgIndex + 1]
if (outputArgIndex > -1 && cliArgs[outputArgIndex + 1]) outputPath = cliArgs[outputArgIndex + 1]
if (commentArgIndex > -1 && cliArgs[commentArgIndex + 1]) comment = cliArgs[commentArgIndex + 1]
if(optimizeArgIndex > -1) optimize = true

inputPath = path.resolve(inputPath)
outputPath = path.resolve(outputPath)

const commentSection = comment ? `/**\n * ${comment}\n */\n` : ''

const namespaces = getNamespaces(inputPath)

if (subCommand === 'toc') {
  let outputFile = outputPath
  if (!outputFile.endsWith('.ts')) {
    outputFile = path.join(outputFile, 'resources.ts')
  }

  let nsToUse = namespaces
  const convertToTs = cliArgs.indexOf('-cts') > 0
  const del = cliArgs.indexOf('-d') > 0
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
  const typeDefinitionFile = mergeResourcesAsInterface(namespaces, {optimize})
  fs.writeFileSync(outputFile, commentSection + typeDefinitionFile, 'utf-8')
  console.log(`created interface resources file for ${namespaces.length} namespaces: ${outputFile}`)
}
