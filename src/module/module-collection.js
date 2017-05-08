import Module from './module';
import { composeReducers, forEachValue } from '../util';

export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module
    this.root = new Module(rawRootModule);

    // register all nested modules
    if (rawRootModule.modules) {
      forEachValue(rawRootModule.modules, (rawModule, key) => {
        this.register([key], rawModule);
      });
    }
  }

  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key);
    }, this.root);
  }

  makeReducers () {
    const unregister = (state, action) => {
      const { type, path } = action;
      if (type === '@@yax/unregister') {
        const parent = path.slice(0, -1).reduce((cur, p) => {
          return cur[p];
        }, state);
        delete parent[path[path.length - 1]];
      }
      return state;
    };
    return composeReducers(unregister, this.root.makeReducers());
  }

  getNamespace (path) {
    let module = this.root;
    return path.reduce((namespace, key) => {
      module = module.getChild(key);
      return namespace + key + '/';
    }, '');
  }

  register (path, rawModule) {
    const parent = this.get(path.slice(0, -1));
    const newModule = new Module(rawModule);
    parent.addChild(path[path.length - 1], newModule);

    // register nested modules
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule);
      });
    }
  }

  unregister (path) {
    const parent = this.get(path.slice(0, -1));
    const key = path[path.length - 1];
    parent.removeChild(key);
  }
}
