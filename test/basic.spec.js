import {
  tocForResources,
  mergeResources,
  mergeResourcesAsInterface,
  json2ts
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
  name: 'ns-B',
  path: '/some/path/locales/en/ns-B.json',
  resources: {
    k21: 'v21',
    k22: 'v22',
    k23: {
      d23: 'v23'
    }
  }
}

const allMerged = { nsA: nsA.resources, 'ns-B': nsB.resources }

const toc = `import nsA from './locales/en/nsA.json';
import nsB from './locales/en/ns-B.json';

const resources = {
  nsA,
  'ns-B': nsB
} as const;

export default resources;
`

const mergedInterface = `interface Resources {
  "nsA": {
    "k1": "v1",
    "k2": "v2",
    "k3": {
      "d3": "v3"
    }
  },
  "ns-B": {
    "k21": "v21",
    "k22": "v22",
    "k23": {
      "d23": "v23"
    }
  }
}

export default Resources;
`

const nsAts = `const ns = {
  "k1": "v1",
  "k2": "v2",
  "k3": {
    "d3": "v3"
  }
} as const;

export default ns;
`

describe('tocForResources', () => {
  it('should generate a toc file content from namespace resources', async () => {
    const tocRet = tocForResources([nsA, nsB], '/some/path')
    // console.log(tocRet)
    should(tocRet).eql(toc)
  })

  describe('win', () => {
    it('should generate a toc file content from namespace resources', async () => {
      const nsAWin = { ...nsA }
      nsAWin.path = nsAWin.path.replace(/\//g, '\\')
      // nsAWin.path = 'C:' + nsAWin.path
      const nsBWin = { ...nsB }
      nsBWin.path = nsBWin.path.replace(/\//g, '\\')
      // nsBWin.path = 'C:' + nsBWin.path
      const tocRet = tocForResources([nsAWin, nsBWin], '\\some\\path')
      // console.log(tocRet)
      should(tocRet).eql(toc)
    })
  })
})

describe('mergeResources', () => {
  it('should generate a big json from namespace resources', async () => {
    const merged = mergeResources([nsA, nsB])
    // console.log(merged)
    should(merged).eql(allMerged)
  })
})

describe('mergeResourcesAsInterface', () => {
  it('should generate a big interface file content from namespace resources', async () => {
    const merged = mergeResourcesAsInterface([nsA, nsB])
    // console.log(merged)
    should(merged).eql(mergedInterface)
  })
})

describe('json2ts', () => {
  it('should generate a ts file content from resources', async () => {
    const ret = json2ts(nsA.resources)
    // console.log(ret)
    should(ret).eql(nsAts)
  })
})
