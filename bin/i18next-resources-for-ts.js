#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const getNamespaces = require('./getNamespaces.js')
const {
  tocForResources,
  mergeResources
} = require('../')

const cliArgs = process.argv.slice(2)

const subCommands = [
  'toc',
  'merge'
]

if (cliArgs.length === 0 || subCommands.indexOf(cliArgs[0]) < 0) {
  throw new Error(`Please define an appropriate subcommand: ${subCommands.join(', ')}!`)
}

const subCommand = cliArgs[0]

let inputPath = process.cwd()
let outputPath = inputPath
if (cliArgs.length > 0 && cliArgs[1].indexOf('-') !== 0) {
  inputPath = cliArgs[1]
  outputPath = inputPath
}

const inputArgIndex = cliArgs.indexOf('-i')
const outputArgIndex = cliArgs.indexOf('-o')
if (inputArgIndex > -1 && cliArgs[inputArgIndex + 1]) inputPath = cliArgs[inputArgIndex + 1]
if (outputArgIndex > -1 && cliArgs[outputArgIndex + 1]) outputPath = cliArgs[outputArgIndex + 1]

inputPath = path.resolve(inputPath)
outputPath = path.resolve(outputPath)

const namespaces = getNamespaces(inputPath)

if (subCommand === 'toc') {
  let outputFile = outputPath
  if (!outputFile.endsWith('.ts')) {
    outputFile = path.join(outputFile, 'resources.ts')
  }
  const toc = tocForResources(namespaces, outputFile)
  fs.writeFileSync(outputFile, toc, 'utf-8')
  console.log(`created toc resources file for ${namespaces.length} namespaces: ${outputFile}`)
}

if (subCommand === 'merge') {
  const merged = mergeResources(namespaces)
  let outputFile = outputPath
  if (!outputFile.endsWith('.json')) {
    outputFile = path.join(outputFile, 'resources.json')
  }
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf-8')
  console.log(`created merged resources file for ${namespaces.length} namespaces: ${outputFile}`)
}
