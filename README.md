Yax (Yet Another Store)
=======================

[![NPM version](https://img.shields.io/npm/v/yax.svg)](https://www.npmjs.com/package/yax)
[![NPM downloads](https://img.shields.io/npm/dm/yax.svg)](https://www.npmjs.com/package/yax)
[![Build Status](https://travis-ci.org/d-band/yax.svg?branch=master)](https://travis-ci.org/d-band/yax)
[![Coverage Status](https://coveralls.io/repos/github/d-band/yax/badge.svg?branch=master)](https://coveralls.io/github/d-band/yax?branch=master)
[![Dependency Status](https://david-dm.org/d-band/yax.svg)](https://david-dm.org/d-band/yax)
[![Greenkeeper badge](https://badges.greenkeeper.io/d-band/yax.svg)](https://greenkeeper.io/)

> Yet another store using redux. (Inspired by vuex and dva)

## Demos & Plugins

- [yax-router](https://github.com/d-band/yax-router): Router plugin for yax (Using react-router).
- [HackerNews](https://github.com/d-band/yax-hackernews): HackerNews clone built with Yax, based on dva-hackernews.

## Getting Started

### Install

```bash
$ npm install --save yax
```

### Usage Example

```javascript
import yax from 'yax';

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
const store = yax({
  modules: { count }
});

store.subscribe(() =>
  console.log(store.getState())
);

store.dispatch({
  type: 'count/add',
  payload: 2
});
store.dispatch({
  type: 'count/minus',
  payload: 1
});
```

Usage with React

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import yax from 'yax';
import count from './count';
import App from './App';

const store = yax({
  modules: { count }
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

Usage with `redux-persist`

```javascript
import yax from 'yax';
import { persistStore, autoRehydrate } from 'redux-persist';

const store = yax(options, autoRehydrate());

persistStore(store, { storage: Storage });
```

Usage with `react-navigation`

```javascript
import yax, { compose, composeReducers, mapReducers } from 'yax';
import { StackNavigator } from 'react-navigation';

const AppNavigator = StackNavigator(AppRouteConfigs);
const initialAction = AppNavigator.router.getActionForPathAndParams('Login');
const initialState = AppNavigator.router.getStateForAction(initialAction);

const navReducer = (state = initialState, action) => {
  const nextState = AppNavigator.router.getStateForAction(action, state);
  return nextState || state;
};
const navEnhancer = createStore => (reducer, preloadedState, enhancer) => {
  const appReducer = composeReducers(
    reducer,
    mapReducers({
      nav: navReducer
    })
  );
  return createStore(appReducer, preloadedState, enhancer);
};
const store = yax({
  modules: { foo, bar }
}, compose(
  navEnhancer,
  otherEnhancers
));


// In modules with `commit`
import { NavigationActions } from 'react-navigation';

const LOGIN = NavigationActions.navigate({ routeName: 'Login' });
const BACK = NavigationActions.back();
...
commit(LOGIN, true);
commit(BACK, true);
```

## API Reference

```javascript
import yax, {
  // Redux original functions
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  // Yax helper functions
  composeReducers,
  mapReducers,
  mapState,
  mapActions
} from 'yax';
```

### `yax(options = {}, [enhancer])`


- **`options.state`**

  The root state object for the store.
  
- **`options.reducers`**

  ```
  { [type: string]: Reducer }
  ```
  ```
  type Reducer = (state, payload) => state
  ```
  > `state` will be module local state if defined in a module
  
- **`options.actions`**

  ```
  { [type: string]: Action }
  ```
  ```
  type Action = ({ dispatch, commit, select }, payload) => Promise
  ```
  ```
  type dispatch = (type, payload, isRoot) => Promise
  type commit   = (type, payload, isRoot) => any
  ```
  > `isRoot=true` will dispatch actions or commit reducers in the global namespace
  
  ```
  type select   = (Selector) => Selector(state, rootState)
  type Selector = (state, rootState) => any
  ```
  > `select()` without `Selector` will return `state`
  
- **`options.modules`**

  ```
  { [type: string]: Module }
  ```
  ```
  type Module = { state, reducers, actions, modules }
  ```
  
- **`enhancer`**

  ```
  type StoreEnhancer = (next: StoreCreator) => StoreCreator
  ```
  > [redux store enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer)

### `composeReducers(...reducers)`

```javascript
const f = (state, action) => {};
const g = (state, action) => {};
// (state, action) => g(f(state, action), action)
const reducer = composeReducers(f, g);
```

### `mapReducers(reducers)`

> Like with `combineReducers` but composability. [More](https://github.com/reactjs/redux/pull/2059#issuecomment-256798218)

```javascript
const foo = (state, action) => {};
const bar = (state, action) => {};
const reducer = mapReducers({ foo, bar });
```

### `mapState` and `mapActions`

> Used for [react-redux `connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)

```
const App = ({ foo, bar, addFoo, addBar }) => {
  addFoo(payload);
  addBar(payload);
  return <span>{foo} / {bar}</span>;
};
connect(
  mapState({
    foo: 'foo/value',
    bar: 'bar/value'
  }),
  mapActions({
    addFoo: 'foo/add',
    addBar: 'bar/add'
  })
)(App);
```

## Report a issue

* [All issues](https://github.com/d-band/yax/issues)
* [New issue](https://github.com/d-band/yax/issues/new)

## License

yax is available under the terms of the MIT License.
