import { combineReducers } from 'redux';

export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key));
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object';
}

export function isPromise (val) {
  return val && typeof val.then === 'function';
}

export function assert (condition, msg) {
  if (!condition) throw new Error(`[yax] ${msg}`);
}

export function composeReducers (...reducers) {
  return (state, action) => {
    return reducers.reduce((p, r) => r(p, action), state);
  };
}

export function mapReducers (reducers) {
  const combined = combineReducers(reducers);
  return (state, action) => {
    const reducer = (p, k) => ({ ...p, [k]: state[k] });
    const combinedState = Object.keys(reducers).reduce(reducer, {});
    return Object.assign({}, state, combined(combinedState, action));
  };
}

export function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state;
}
