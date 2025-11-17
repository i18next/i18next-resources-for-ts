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
    },
    'k_error.api_status.404': 'The resource you are looking for could not be found.\nIt may have been moved, deleted, or the link is incorrect.'
  }
}
const nsB = {
  name: 'nsB-B',
  path: '/some/path/locales/en/nsB-B.json',
  resources: {
    k21: 'v21',
    k22: 'v22\nnextline',
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
    },
    "k_error.api_status.404": "The resource you are looking for could not be found.\\nIt may have been moved, deleted, or the link is incorrect."
  },
  "nsB-B": {
    "k21": "v21",
    "k22": "v22\\nnextline",
    "k23": {
      "d23": "v23"
    }
  }
}

export default Resources;
`

// new test: expect indentation option to affect nesting indentation (indentation = 4)
const mergedInterfaceIndent4 = `interface Resources {
  "nsA": {
      "k1": "v1",
      "k2": "v2",
      "k3": {
          "d3": "v3"
      },
      "k_error.api_status.404": "The resource you are looking for could not be found.\\nIt may have been moved, deleted, or the link is incorrect."
  },
  "nsB-B": {
      "k21": "v21",
      "k22": "v22\\nnextline",
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
  },
  "k_error.api_status.404": "The resource you are looking for could not be found.\\nIt may have been moved, deleted, or the link is incorrect."
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
  describe('with optimize flag', () => {
    it('should generate a big interface file content from namespace resources', async () => {
      const merged = mergeResourcesAsInterface([nsA, nsB], { optimize: true })
      // console.log(merged)
      should(merged).eql(mergedInterface)
    })

    it('should respect indentation option (number of spaces)', async () => {
      const merged = mergeResourcesAsInterface([nsA, nsB], { optimize: true, indentation: 4 })
      // console.log(merged)
      should(merged).eql(mergedInterfaceIndent4)
    })
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

  describe('deep nested structures', () => {
    const nsDeep = {
      name: 'nsDeep',
      path: '/some/path/locales/en/nsDeep.json',
      resources: {
        level1: {
          level2: {
            level3: {
              lvl4: 'v4',
              arr: ['a', 'b'],
              deep_key_one: 'one',
              deep_key_many: 'many'
            }
          }
        }
      }
    }

    const deepInterface = `interface Resources {
  "nsDeep": {
    "level1": {
      "level2": {
        "level3": {
          "arr": ["a", "b"],
          "deep_key_many": "many",
          "deep_key_one": "one",
          "lvl4": "v4"
        }
      }
    }
  }
}

export default Resources;
`

    const deepInterfaceOptimized = `interface Resources {
  "nsDeep": {
    "level1": {
      "level2": {
        "level3": {
          "arr": ["a", "b"],
          "deep_key": "one" | "many",
          "lvl4": "v4"
        }
      }
    }
  }
}

export default Resources;
`

    it('should handle deeper nested structures', () => {
      const ret = mergeResourcesAsInterface([nsDeep])
      should(ret).eql(deepInterface)
    })

    it('should optimize plural keys in deep structures', () => {
      const ret = mergeResourcesAsInterface([nsDeep], { optimize: true })
      should(ret).eql(deepInterfaceOptimized)
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
