# Introduction

[![Actions](https://github.com/i18next/i18next-resources-for-ts/workflows/node/badge.svg)](https://github.com/i18next/i18next-resources-for-ts/actions?query=workflow%3Anode)
[![npm version](https://img.shields.io/npm/v/i18next-resources-for-ts.svg?style=flat-square)](https://www.npmjs.com/package/i18next-resources-for-ts)

This package helps to transform resources to be used in a typesafe i18next project.

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/i18next-resources-for-ts).

```bash
# npm package
$ npm install i18next-resources-for-ts
```

## Usage via code (toc):

```js
import { tocForResources } from 'i18next-resources-for-ts'

const nsA = {
  name: 'nsA',
  path: '/some/path/locales/en/nsA.json'
}
const nsB = {
  name: 'nsB',
  path: '/some/path/locales/en/nsB.json'
}

const toc = tocForResources([nsA, nsB], '/some/path')
// import nsA from './locales/en/nsA.json';
// import nsB from './locales/en/nsB.json';
// 
// const resources = {
//   nsA,
//   nsB
// };
// 
// export default resources;
```

## Usage via code (merge):

```js
import { mergeResources } from 'i18next-resources-for-ts'

const nsA = {
  name: 'nsA',
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
  resources: {
    k21: 'v21',
    k22: 'v22',
    k23: {
      d23: 'v23'
    }
  }
}

const merged = mergeResources([nsA, nsB])
// {
//   nsA: {
//     k1: 'v1',
//     k2: 'v2',
//     k3: {
//       d3: 'v3'
//     }
//   },
//   nsB: {
//     k21: 'v21',
//     k22: 'v22',
//     k23: {
//       d23: 'v23'
//     }
//   }
// }
```

## Usage via code (interface):

```js
import { mergeResourcesAsInterface } from 'i18next-resources-for-ts'

const nsA = {
  name: 'nsA',
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
  resources: {
    k21: 'v21',
    k22: 'v22',
    k23: {
      d23: 'v23'
    }
  }
}

const definition = mergeResourcesAsInterface([nsA, nsB])
// interface Resources {
//   nsA: {
//     k1: 'v1',
//     k2: 'v2',
//     k3: {
//       d3: 'v3'
//     }
//   },
//   nsB: {
//     k21: 'v21',
//     k22: 'v22',
//     k23: {
//       d23: 'v23'
//     }
//   }
// }

// export default Resources;
```

## Usage via CLI:

```sh
# use it with npx
npx i18next-resources-for-ts subcommand -i /Users/user/my/input -o /Users/user/my/output

# or install it globally
npm install i18next-resources-for-ts -g

# subcommand is either toc or merge
# -i is the input path
# -o is the output path
# if the output path is not provided, it will use the input path as base path for the result file

i18next-resources-for-ts toc -i /Users/user/my/input -o /Users/user/my/output.ts
i18next-resources-for-ts interface -i /Users/user/my/input -o /Users/user/my/output.d.ts
i18next-resources-for-ts merge -i /Users/user/my/input -o /Users/user/my/output.json
# i18next-resources-for-ts toc /Users/user/my/input -o /Users/user/my/output
# i18next-resources-for-ts toc -o /Users/user/my/output
# i18next-resources-for-ts toc -i /Users/user/my/input
# i18next-resources-for-ts toc
# 
# toc accepts also the optional -cts argument that will automatically convert json to ts files and the optional -d argument that will delete the original json files
```

*Make sure your folder structure contains all relevant namespaces (in your source/reference language):*

```sh
└── namespace.json
```

i.e.
```sh
├── translation.json
└── common.json
```

### Check these examples to see how to use it:

- [next-i18next](https://github.com/i18next/next-i18next/blob/c419b2be3b4772de17309db474facd6dbeb86888/examples/simple/package.json#L13)
- [next-13-app-dir-i18next-example-ts](https://github.com/i18next/next-13-app-dir-i18next-example-ts/blob/5ae41d390dd61630becf5671fb886d925b42cc10/package.json#L13)
- [react-i18next-example-app-ts](https://github.com/locize/react-i18next-example-app-ts/blob/574531491d7e8a7c67bea1187e2d9c13982d5112/package.json#L35)

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**From the creators of i18next: localization as a service - locize.com**

A translation management system built around the i18next ecosystem - [locize.com](https://locize.com).

![locize](https://locize.com/img/ads/github_locize.png)

With using [locize](http://locize.com/?utm_source=react_i18next_readme&utm_medium=github) you directly support the future of i18next.

---
