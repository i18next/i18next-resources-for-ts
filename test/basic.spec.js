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
  name: 'nsB-B',
  path: '/some/path/locales/en/nsB-B.json',
  resources: {
    k21: 'v21',
    k22: 'v22',
    k23: {
      d23: 'v23'
    }
  }
}

const allMerged = { nsA: nsA.resources, 'nsB-B': nsB.resources }

const toc = `import nsA from '../locales/en/nsA.json';
import nsBB from '../locales/en/nsB-B.json';

const resources = {
  nsA,
  'nsB-B': nsBB
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
  "nsB-B": {
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

const nsWithPlurals = {
  name: 'nsWithPlurals',
  path: '/some/path/locales/en/nsWithPlurals.json',
  resources: {
    abc_one: 'one',
    abc_many: 'many',
    def: ['ghi', 'jkl']
  }
}

const nsWithPluralsMergedInterface = `interface Resources {
  "nsWithPlurals": {
    "abc_many": "many",
    "abc_one": "one",
    "def": ["ghi", "jkl"]
  }
}

export default Resources;
`

const nsWithPluralsMergedInterfaceOptimized = `interface Resources {
  "nsWithPlurals": {
    "abc": "one" | "many",
    "def": ["ghi", "jkl"]
  }
}

export default Resources;
`

describe('tocForResources', () => {
  it('should generate a toc file content from namespace resources', async () => {
    const tocRet = tocForResources([nsA, nsB], '/some/path/@types')
    // console.log(tocRet)
    should(tocRet).eql(toc)
  })

  describe('with target filename', () => {
    it('should generate a toc file content from namespace resources', async () => {
      const tocRet = tocForResources([nsA, nsB], '/some/path/@types/resources.ts')
      // console.log(tocRet)
      should(tocRet).eql(toc)
    })
  })

  describe('win', () => {
    it('should generate a toc file content from namespace resources', async () => {
      const nsAWin = { ...nsA }
      nsAWin.path = nsAWin.path.replace(/\//g, '\\')
      nsAWin.path = 'C:' + nsAWin.path
      nsAWin.path = 'C:\\some\\path\\locales\\en\\nsA.json'
      const nsBWin = { ...nsB }
      nsBWin.path = nsBWin.path.replace(/\//g, '\\')
      nsBWin.path = 'C:' + nsBWin.path
      nsBWin.path = 'C:\\some\\path\\locales\\en\\nsB-B.json'
      const tocRet = tocForResources([nsAWin, nsBWin], 'C:\\some\\path\\@types')
      // console.log(tocRet)
      should(tocRet).eql(toc)
    })

    describe('with target filename', () => {
      it('should generate a toc file content from namespace resources', async () => {
        const nsAWin = { ...nsA }
        nsAWin.path = nsAWin.path.replace(/\//g, '\\')
        nsAWin.path = 'C:' + nsAWin.path
        nsAWin.path = 'C:\\some\\path\\locales\\en\\nsA.json'
        const nsBWin = { ...nsB }
        nsBWin.path = nsBWin.path.replace(/\//g, '\\')
        nsBWin.path = 'C:' + nsBWin.path
        nsBWin.path = 'C:\\some\\path\\locales\\en\\nsB-B.json'
        const tocRet = tocForResources([nsAWin, nsBWin], 'C:\\some\\path\\@types\\resources.ts')
        // console.log(tocRet)
        should(tocRet).eql(toc)
      })
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

  describe('with plurals', () => {
    it('should generate a big interface file content from namespace resources', async () => {
      const merged = mergeResourcesAsInterface([nsWithPlurals])
      // console.log(merged)
      should(merged).eql(nsWithPluralsMergedInterface)
    })

    describe('with optimize flag', () => {
      it('should generate a big interface file content from namespace resources', async () => {
        const merged = mergeResourcesAsInterface([nsWithPlurals], { optimize: true })
        // console.log(merged)
        should(merged).eql(nsWithPluralsMergedInterfaceOptimized)
      })
    })
  })
})

describe('json2ts', () => {
  it('should generate a ts file content from resources', async () => {
    const ret = json2ts(nsA.resources)
    // console.log(ret)
    should(ret).eql(nsAts)
  })
})
