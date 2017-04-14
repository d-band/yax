Yax (Yet Another Store)
=======================

> Yet another store using redux. (Inspired by vuex and dva)

[![NPM version](https://img.shields.io/npm/v/yax.svg)](https://www.npmjs.com/package/yax)
[![NPM downloads](https://img.shields.io/npm/dm/yax.svg)](https://www.npmjs.com/package/yax)
[![Build Status](https://travis-ci.org/d-band/yax.svg?branch=master)](https://travis-ci.org/d-band/yax)
[![Coverage Status](https://coveralls.io/repos/github/d-band/yax/badge.svg?branch=master)](https://coveralls.io/github/d-band/yax?branch=master)
[![Dependency Status](https://david-dm.org/d-band/yax.svg)](https://david-dm.org/d-band/yax)

## Getting Started

### Install

```bash
$ npm install --save yax
```

### Usage Example

```javascript
import { Store } from 'yax';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const count = {
  state: 0,
  reducers: {
    addDone (state, payload) {
      return state + payload;
    },
    minusDone (state, payload) {
      return state - payload;
    }
  },
  actions: {
    async add ({ commit }, payload) {
      await delay(1);
      commit('addDone', payload);
    },
    async minus ({ commit }, payload) {
      await delay(1);
      commit('minusDone', payload);
    }
  }
};
const store = new Store({
  modules: { count }
});

store.dispatch({
  type: 'count/add',
  payload: 2
});
store.dispatch({
  type: 'count/minus',
  payload: 1
});
```

## Report a issue

* [All issues](https://github.com/d-band/yax/issues)
* [New issue](https://github.com/d-band/yax/issues/new)

## License

yax is available under the terms of the MIT License.