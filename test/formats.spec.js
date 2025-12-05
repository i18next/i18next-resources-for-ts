import { createRequire } from 'module'
import should from 'should'
import fs from 'fs'
import path from 'path'
import os from 'os'

const require = createRequire(import.meta.url)
const getNamespaces = require('../bin/getNamespaces.js')

let fixturesDir

describe('getNamespaces formats', () => {
  before(() => {
    fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18next-resources-for-ts-'))

    // JSON
    fs.writeFileSync(path.join(fixturesDir, 'ns1.json'), JSON.stringify({ key: 'value_json' }))

    // YAML
    fs.writeFileSync(path.join(fixturesDir, 'ns2.yml'), 'key: value_yml')
    fs.writeFileSync(path.join(fixturesDir, 'ns3.yaml'), 'key: value_yaml')

    // JS (CommonJS)
    fs.writeFileSync(path.join(fixturesDir, 'ns4.js'), "module.exports = { key: 'value_js' }")

    // CJS
    fs.writeFileSync(path.join(fixturesDir, 'ns5.cjs'), "module.exports = { key: 'value_cjs' }")

    // TS
    fs.writeFileSync(path.join(fixturesDir, 'ns6.ts'), "const r: { key: string } = { key: 'value_ts' }; export default r")

    // MTS
    fs.writeFileSync(path.join(fixturesDir, 'ns7.mts'), "const r: { key: string } = { key: 'value_mts' }; export default r")

    // CTS
    fs.writeFileSync(path.join(fixturesDir, 'ns8.cts'), "const r: { key: string } = { key: 'value_cts' }; export default r")

    // MJS
    fs.writeFileSync(path.join(fixturesDir, 'ns9.mjs'), "export default { key: 'value_mjs' }")
  })

  after(() => {
    if (fixturesDir && fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true })
    }
  })

  it('should load all supported formats', () => {
    const namespaces = getNamespaces(fixturesDir)

    should(namespaces).be.an.Array()
    should(namespaces.length).equal(9)

    const findNs = (name) => namespaces.find(n => n.name === name)

    should(findNs('ns1').resources).eql({ key: 'value_json' })
    should(findNs('ns2').resources).eql({ key: 'value_yml' })
    should(findNs('ns3').resources).eql({ key: 'value_yaml' })
    should(findNs('ns4').resources).eql({ key: 'value_js' })
    should(findNs('ns5').resources).eql({ key: 'value_cjs' })
    should(findNs('ns6').resources).eql({ key: 'value_ts' })
    should(findNs('ns7').resources).eql({ key: 'value_mts' })
    should(findNs('ns8').resources).eql({ key: 'value_cts' })
    should(findNs('ns9').resources).eql({ key: 'value_mjs' })
  })
})
