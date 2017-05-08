import { forEachValue, mapReducers } from '../util';

export default class Module {
  constructor (rawModule) {
    this._children = Object.create(null);
    this._rawModule = rawModule;
    this._reducers = {};
  }

  get state () {
    const { state } = this._rawModule;
    if (state === undefined) {
      return {};
    }
    return state;
  }

  addChild (key, module) {
    this._children[key] = module;
  }

  removeChild (key) {
    delete this._children[key];
  }

  getChild (key) {
    return this._children[key];
  }

  forEachChild (fn) {
    forEachValue(this._children, fn);
  }

  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  }

  forEachReducer (fn) {
    if (this._rawModule.reducers) {
      forEachValue(this._rawModule.reducers, fn);
    }
  }

  cleanReducers () {
    this._reducers = {};
  }

  addReducer (actionType, handler) {
    this._reducers[actionType] = handler;
  }

  makeReducers () {
    return (state = this.state, action) => {
      const { type, payload } = action;
      const handler = this._reducers[type];
      if (handler) {
        return handler(state, payload);
      }
      if (Object.keys(this._children).length) {
        const tmp = {};
        this.forEachChild((child, key) => {
          tmp[key] = child.makeReducers();
        });

        return mapReducers(tmp)(state, action);
      }
      return state;
    };
  }
}
