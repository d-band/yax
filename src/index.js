import { createStore, applyMiddleware } from 'redux';
import ModuleCollection from './module/module-collection';
import { isObject, isPromise, assert } from './util';

export default function yax (options = {}) {
  let _actions = {};
  let _modules = new ModuleCollection(options);

  // init root module.
  // this also recursively registers all sub-modules
  _installModule([], _modules.root);

  const middleware = () => (next) => (action) => {
    if (isObject(action)) {
      const { type, payload } = action;
      const entry = _actions[type];
      if (entry) {
        return entry.length > 1
          ? Promise.all(entry.map(handler => handler(payload)))
          : entry[0](payload);
      }
    }
    return next(action);
  };
  const _store = createStore(
    _modules.makeReducers(),
    options.state || {},
    applyMiddleware(middleware)
  );

  function registerModule (path, rawModule) {
    if (typeof path === 'string') path = [path];
    assert(Array.isArray(path), `module path must be a string or an Array.`);
    _modules.register(path, rawModule);
    _installModule(path, _modules.get(path));
    _resetReducers();
  }

  function unregisterModule (path) {
    if (typeof path === 'string') path = [path];
    assert(Array.isArray(path), `module path must be a string or an Array.`);
    _modules.unregister(path);
    _resetStore();
    _store.dispatch({ type: '@@yax/unregister', path });
  }

  return {
    registerModule,
    unregisterModule,
    ..._store
  };

  /**
   * Private Methods
   */

  function _getNestedState (state, path) {
    return path.length
      ? path.reduce((state, key) => state[key], state)
      : state;
  }

  // make localized dispatch, commit and state
  function _makeLocalContext (namespace, path) {
    const wrapFn = (_type, payload, isRoot) => {
      const type = isRoot ? _type : namespace + _type;
      // redux dispatch
      return _store.dispatch({ type, payload });
    };
    const local = {
      dispatch: wrapFn,
      commit: wrapFn,
      select: (fn) => {
        // redux state
        const rootState = _store.getState();
        const state = _getNestedState(rootState, path);
        return fn ? fn(state, rootState) : state;
      }
    };

    return local;
  }

  function _registerAction (type, handler, local) {
    const entry = _actions[type] || (_actions[type] = []);
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

  function _installModule (path, module) {
    const namespace = _modules.getNamespace(path);

    const local = module.context = _makeLocalContext(namespace, path);

    module.cleanReducers();
    module.forEachReducer((reducer, key) => {
      const actionType = namespace + key;
      module.addReducer(actionType, reducer);
    });
    module.forEachAction((action, key) => {
      const actionType = namespace + key;
      _registerAction(actionType, action, local);
    });

    module.forEachChild((child, key) => {
      _installModule(path.concat(key), child);
    });
  }

  function _resetReducers () {
    const reducer = _modules.makeReducers();
    _store.replaceReducer(reducer);
  }

  function _resetStore () {
    _actions = {};
    // init all modules
    _installModule([], _modules.root);
    _resetReducers();
  }
}
