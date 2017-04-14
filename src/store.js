import { createStore, applyMiddleware } from 'redux';
import ModuleCollection from './module/module-collection';
import { isObject, isPromise, assert } from './util';

export default class Store {
  constructor (options = {}) {
    this._actions = {};
    this._modules = new ModuleCollection(options);

    // init root module.
    // this also recursively registers all sub-modules
    installModule(this, [], this._modules.root);

    const middleware = () => (next) => (action) => {
      if (isObject(action)) {
        const { type, payload } = action;
        const entry = this._actions[type];
        if (entry) {
          return entry.length > 1
            ? Promise.all(entry.map(handler => handler(payload)))
            : entry[0](payload);
        }
      }
      return next(action);
    };
    const _store = createStore(
      this._modules.root.makeReduers(),
      {},
      applyMiddleware(middleware)
    );

    // bind redux store functions
    const { dispatch, subscribe, getState, replaceReducer } = _store;
    this.getState = function bindGetState () {
      return getState.call(_store);
    };
    this.dispatch = function bindDispatch (action) {
      return dispatch.call(_store, action);
    };
    this.subscribe = function bindSubscribe (listener) {
      return subscribe.call(_store, listener);
    };
    this.replaceReducer = function bindReplaceReducer (reducer) {
      return replaceReducer.call(_store, reducer);
    };
    this._store = _store;
  }

  _resetReducers () {
    const nextReducer = this._modules.root.makeReduers();
    this.replaceReducer(nextReducer);
  }

  get reduxStore () {
    return this._store;
  }

  registerModule (path, rawModule) {
    if (typeof path === 'string') path = [path];
    assert(Array.isArray(path), `module path must be a string or an Array.`);
    this._modules.register(path, rawModule);
    installModule(this, path, this._modules.get(path));
    this._resetReducers();
  }

  unregisterModule (path) {
    if (typeof path === 'string') path = [path];
    assert(Array.isArray(path), `module path must be a string or an Array.`);
    this._modules.unregister(path);
    resetStore(this);
  }
}

function resetStore (store) {
  store._actions = {};
  // init all modules
  installModule(store, [], store._modules.root);
  store._resetReducers();
}

function installModule (store, path, module) {
  const namespace = store._modules.getNamespace(path);

  const local = module.context = makeLocalContext(store, namespace, path);

  module.cleanReducers();
  module.forEachReducer((reducer, key) => {
    const actionType = namespace + key;
    module.addReducer(actionType, reducer);
  });
  module.forEachAction((action, key) => {
    const actionType = namespace + key;
    registerAction(store, actionType, action, local);
  });

  module.forEachChild((child, key) => {
    installModule(store, path.concat(key), child);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace, path) {
  const wrapFn = (_type, payload) => {
    const type = namespace + _type;
    // redux dispatch
    return store.dispatch({ type, payload });
  };
  const local = {
    dispatch: wrapFn,
    commit: wrapFn,
    select: (fn) => {
      // redux state
      const rootState = store.getState();
      const state = getNestedState(rootState, path);
      return fn(state, rootState);
    }
  };

  return local;
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload) {
    let res = handler({
      dispatch: local.dispatch,
      commit: local.commit,
      select: local.select
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    return res;
  });
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state;
}
