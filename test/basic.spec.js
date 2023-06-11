import {
  tocForResources,
  mergeResources
} from '../index.js'
import should from 'should'

const nsA = {
  name: 'nsA',
  path: '/some/path/locales/en/nsA.json',
  resources: {
    k1: 'v1',
    k2: 'v2',
    k3: {
      d3: 'v3'
    }
  }
}
const nsB = {
  name: 'nsB',
  path: '/some/path/locales/en/nsB.json',
  resources: {
    k21: 'v21',
    k22: 'v22',
    k23: {
      d23: 'v23'
    }
  }
}

const allMerged = { nsA: nsA.resources, nsB: nsB.resources }

const toc = `import nsA from './locales/en/nsA.json';
import nsB from './locales/en/nsB.json';

export default {
  nsA,
  nsB
}
`

describe('tocForResources', () => {
  it('should generate a toc file content from namespace resources', async () => {
    const tocRet = tocForResources([nsA, nsB], '/some/path')
    // console.log(tocRet)
    should(tocRet).eql(toc)
  })
})

describe('mergeResources', () => {
  it('should generate a big json from namespace resources', async () => {
    const merged = mergeResources([nsA, nsB])
    // console.log(merged)
    should(merged).eql(allMerged)
  })
})
