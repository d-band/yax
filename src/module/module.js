import { combineReducers } from 'redux';
import { forEachValue } from '../util';

export default class Module {
  constructor (rawModule) {
    this._children = Object.create(null);
    this._rawModule = rawModule;
    this._reducers = {};
  }

  get state () {
    return this._rawModule.state;
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

  makeReduers () {
    let hasChild = false;
    const tmp = {};
    this.forEachChild((child, key) => {
      hasChild = true;
      tmp[key] = child.makeReduers();
    });

    return (state = this.state, action) => {
      const { type, payload } = action;
      const handler = this._reducers[type];
      if (handler) {
        return handler(state, payload);
      }
      if (hasChild) {
        return combineReducers(tmp)(state, action);
      }
      return state;
    };
  }
}
