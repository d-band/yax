import { getNestedState } from './util';

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }));
}

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map);
  };
}

export const mapState = normalizeNamespace((namespace, states) => state => {
  const res = {};
  normalizeMap(states).forEach(({ key, val }) => {
    const path = (namespace + val).split('/');
    res[key] = getNestedState(state, path);
  });
  return res;
});

export const mapActions = normalizeNamespace((namespace, actions) => dispatch => {
  const res = {};
  normalizeMap(actions).forEach(({ key, val }) => {
    const type = namespace + val;
    res[key] = payload => dispatch({ type, payload });
  });
  return res;
});
