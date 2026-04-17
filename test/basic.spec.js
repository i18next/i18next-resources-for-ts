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

// NEW TEST: expect double-quote variant when quotes option is 'double'
const tocDoubleQuotes = `import nsA from "../locales/en/nsA.json";
import nsBB from "../locales/en/nsB-B.json";

const resources = {
  nsA,
  "nsB-B": nsBB
} as const;

export default resources;
`

const mergedInterface = `export default interface Resources {
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
`

// new test: expect indentation option to affect nesting indentation (indentation = 4)
const mergedInterfaceIndent4 = `export default interface Resources {
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
`

// indentation as a tab character string
const mergedInterfaceIndentTab = `export default interface Resources {
  "nsA": {
\t  "k1": "v1",
\t  "k2": "v2",
\t  "k3": {
\t\t  "d3": "v3"
\t  },
\t  "k_error.api_status.404": "The resource you are looking for could not be found.\\nIt may have been moved, deleted, or the link is incorrect."
  },
  "nsB-B": {
\t  "k21": "v21",
\t  "k22": "v22\\nnextline",
\t  "k23": {
\t\t  "d23": "v23"
\t  }
  }
}
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

const nsWithPluralsMergedInterface = `export default interface Resources {
  "nsWithPlurals": {
    "abc_many": "many",
    "abc_one": "one",
    "def": ["ghi", "jkl"]
  }
}
`

const nsWithPluralsMergedInterfaceOptimized = `export default interface Resources {
  "nsWithPlurals": {
    "abc": "one" | "many",
    "def": ["ghi", "jkl"]
  }
}
`

// NEW TEST: namespace with numeric and boolean values
const nsWithPrimitives = {
  name: 'nsWithPrimitives',
  path: '/some/path/locales/en/nsWithPrimitives.json',
  resources: {
    count: 42,
    enabled: true,
    ratio: 0.5,
    disabled: false
  }
}

const nsWithPrimitivesMergedInterface = `export default interface Resources {
  "nsWithPrimitives": {
    "count": 42,
    "disabled": false,
    "enabled": true,
    "ratio": 0.5
  }
}
`

describe('tocForResources', () => {
  it('should generate a toc file content from namespace resources', async () => {
    const tocRet = tocForResources([nsA, nsB], '/some/path/@types')
    // console.log(tocRet)
    should(tocRet).eql(toc)
  })

  // quotes option 'double' should be respected (not overridden by defaults)
  it('should respect the double quotes option', async () => {
    const tocRet = tocForResources([nsA, nsB], '/some/path/@types', { quotes: 'double' })
    should(tocRet).eql(tocDoubleQuotes)
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

    // indentation as a string (tab character)
    it('should respect indentation option (tab string)', async () => {
      const merged = mergeResourcesAsInterface([nsA, nsB], { optimize: true, indentation: '\t' })
      should(merged).eql(mergedInterfaceIndentTab)
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

  // number and boolean values should not produce `undefined` in output
  describe('with numeric and boolean values', () => {
    it('should correctly render number and boolean values', async () => {
      const merged = mergeResourcesAsInterface([nsWithPrimitives])
      should(merged).eql(nsWithPrimitivesMergedInterface)
      // Sanity check: no `undefined` should appear in output
      should(merged).not.containEql('undefined')
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

    const deepInterface = `export default interface Resources {
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
`

    const deepInterfaceOptimized = `export default interface Resources {
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

describe('mergeResourcesAsInterface special chars in keys', () => {
  const nsSpecialKeys = {
    name: 'nsSpecial',
    path: '/some/path/locales/en/nsSpecial.json',
    resources: {
      'Line one.\nLine two': 'value with newline key',
      'Tab\there': 'value with tab key',
      'Back\\slash': 'value with backslash key',
      'Quote"inside': 'value with quote key',
      'Mixed\n\t\\"chars': 'value with mixed special chars'
    }
  }

  const expectedSpecialKeysInterface = `export default interface Resources {
  "nsSpecial": {
    "Back\\\\slash": "value with backslash key",
    "Line one.\\nLine two": "value with newline key",
    "Mixed\\n\\t\\\\\\"chars": "value with mixed special chars",
    "Quote\\"inside": "value with quote key",
    "Tab\\there": "value with tab key"
  }
}
`

  it('should correctly escape special characters in keys', () => {
    const merged = mergeResourcesAsInterface([nsSpecialKeys])
    should(merged).eql(expectedSpecialKeysInterface)
  })

  it('should produce valid TypeScript (no literal newlines in keys)', () => {
    const merged = mergeResourcesAsInterface([nsSpecialKeys])
    // Ensure no unescaped newlines appear inside key strings
    // Split into lines and check none have an unclosed quote
    const lines = merged.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('"') && trimmed.includes(':')) {
        // Key line - the key portion should not contain literal newline/tab
        const keyMatch = trimmed.match(/^"([^"]*(?:\\"[^"]*)*)":\s/)
        if (keyMatch) {
          should(keyMatch[1]).not.match(/[\n\t]/)
        }
      }
    }
  })
})

// --- interpolation placeholder normalisation (https://github.com/i18next/i18next-cli/issues/218) ---
// Translation values authored with spaces inside {{ }} delimiters
// (e.g. "{{ variable }}") must be normalised to "{{variable}}" in the
// emitted .d.ts.  Without this, TypeScript derives " variable " (with
// spaces) as the expected options key, producing an unsatisfiable type.
describe('mergeResourcesAsInterface interpolation normalisation', () => {
  const nsSpaced = {
    name: 'nsSpaced',
    path: '/some/path/locales/en/nsSpaced.json',
    resources: {
      // spaced — the problematic form from issue https://github.com/i18next/i18next-cli/issues/218
      greeting: 'Hello {{ name }}!',
      // already correct — must be left unchanged
      farewell: 'Goodbye {{name}}!',
      // multiple spaced placeholders in a single value
      multi: '{{ greeting }}, {{ name }}!',
      // no placeholder at all
      plain: 'No interpolation here'
    }
  }

  // The emitted string literals must have trimmed placeholder names.
  const nsSpacedInterface = `export default interface Resources {
  "nsSpaced": {
    "farewell": "Goodbye {{name}}!",
    "greeting": "Hello {{name}}!",
    "multi": "{{greeting}}, {{name}}!",
    "plain": "No interpolation here"
  }
}
`

  it('should normalise spaced {{ placeholders }} in emitted string literals', () => {
    const merged = mergeResourcesAsInterface([nsSpaced])
    should(merged).eql(nsSpacedInterface)
  })

  it('should not alter already-correct {{placeholders}}', () => {
    const merged = mergeResourcesAsInterface([nsSpaced])
    // The farewell value must be passed through unchanged
    should(merged).containEql('"farewell": "Goodbye {{name}}!"')
  })

  it('should not emit any spaced {{ placeholder }} patterns in output', () => {
    const merged = mergeResourcesAsInterface([nsSpaced])
    // No {{ followed by a space should appear in the output
    should(merged).not.match(/\{\{\s/)
  })

  describe('with optimize flag (plural union branch)', () => {
    const nsSpacedPlurals = {
      name: 'nsSpacedPlurals',
      path: '/some/path/locales/en/nsSpacedPlurals.json',
      resources: {
        // plural pair — both values carry spaced placeholders
        item_one: '{{ count }} item',
        item_many: '{{ count }} items'
      }
    }

    const nsSpacedPluralsOptimized = `export default interface Resources {
  "nsSpacedPlurals": {
    "item": "{{count}} item" | "{{count}} items"
  }
}
`

    it('should normalise spaced placeholders inside union members', () => {
      const merged = mergeResourcesAsInterface([nsSpacedPlurals], { optimize: true })
      should(merged).eql(nsSpacedPluralsOptimized)
    })

    it('should not emit any spaced {{ placeholder }} patterns in optimized output', () => {
      const merged = mergeResourcesAsInterface([nsSpacedPlurals], { optimize: true })
      should(merged).not.match(/\{\{\s/)
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
