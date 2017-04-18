import expect from 'expect';
import yax from '../src/index';
import count from './count';

describe('basic', () => {
  it('basic module', (done) => {
    const store = yax({
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

    setTimeout(() => {
      expect(store.getState().count).toEqual(1);
      done();
    }, 100);
  });

  it('basic module registration', () => {
    const store = yax({
      modules: {
        foo: {
          state: { bar: 1 },
          reducers: {
            inc: state => {
              state.bar++;
              return state;
            }
          },
          actions: {
            incFoo: ({ commit }) => commit('inc')
          }
        }
      }
    });
    store.registerModule('hi', {
      state: { a: 1 },
      reducers: {
        inc: state => {
          state.a++;
          return state;
        }
      },
      actions: {
        incFoo: ({ commit }) => commit('inc')
      }
    });

    expect(store.getState().hi.a).toEqual(1);
    expect(store.getState().foo.bar).toEqual(1);

    // test dispatching actions defined in dynamic module
    store.dispatch({ type: 'foo/inc' });
    store.dispatch({ type: 'hi/inc' });
    expect(store.getState().hi.a).toEqual(2);
    expect(store.getState().foo.bar).toEqual(2);

    // unregister
    store.unregisterModule('hi');
    expect(store.getState().hi).toEqual(undefined);

    // assert initial modules still work as expected after unregister
    store.dispatch({ type: 'foo/incFoo' });
    expect(store.getState().foo.bar).toEqual(3);
  });

  it('basic select', () => {
    const store = yax({
      state: {
        foo: 1
      },
      modules: {
        count: {
          state: { a: 1 },
          reducers: {
            addDone (state, payload) {
              state.a += payload;
              return state;
            },
            minusDone (state, payload) {
              state.a -= payload;
              return state;
            }
          },
          actions: {
            add ({ commit, select }) {
              const { a } = select();
              commit('addDone', a);
            },
            minus ({ commit, select }) {
              const v = select((state, rootState) => rootState.foo);
              commit('minusDone', v);
            }
          }
        }
      }
    });

    store.dispatch({
      type: 'count/add'
    });
    store.dispatch({
      type: 'count/add'
    });
    store.dispatch({
      type: 'count/minus'
    });

    expect(store.getState().foo).toEqual(1);
    expect(store.getState().count.a).toEqual(3);
  });

  it('basic module register', (done) => {
    const store = yax({
      modules: {
        foo: {}
      }
    });
    // register twice
    store.registerModule('count', count);
    store.registerModule('count', count);
    // register nested
    store.registerModule(['foo', 'count'], count);

    store.dispatch({
      type: 'count/add',
      payload: 2
    });
    store.dispatch({
      type: 'count/minus',
      payload: 1
    });
    store.dispatch({
      type: 'foo/count/add',
      payload: 2
    });
    store.dispatch({
      type: 'foo/count/minus',
      payload: 1
    });

    setTimeout(() => {
      expect(store.getState().count).toEqual(2);
      expect(store.getState().foo.count).toEqual(1);
      done();
    }, 100);
  });

  it('basic nested modules', () => {
    const reducers = {
      add ({ a }, n) {
        return { a: a + n };
      }
    };
    const store = yax({
      state: { a: 1 },
      reducers,
      modules: {
        nested: {
          state: { a: 2 },
          reducers,
          modules: {
            one: {
              state: { a: 3 },
              reducers
            },
            nested: {
              modules: {
                two: {
                  state: { a: 4 },
                  reducers
                },
                three: {
                  state: { a: 5 },
                  reducers
                }
              }
            }
          }
        },
        four: {
          state: { a: 6 },
          reducers
        }
      }
    });

    store.dispatch({ type: 'add', payload: 1 });
    store.dispatch({ type: 'nested/add', payload: 1 });
    store.dispatch({ type: 'nested/one/add', payload: 1 });
    store.dispatch({ type: 'nested/nested/two/add', payload: 1 });
    store.dispatch({ type: 'nested/nested/three/add', payload: 1 });
    store.dispatch({ type: 'four/add', payload: 1 });

    expect(store.getState().a).toEqual(2);
    expect(store.getState().nested.a).toEqual(3);
    expect(store.getState().nested.one.a).toEqual(4);
    expect(store.getState().nested.nested.two.a).toEqual(5);
    expect(store.getState().nested.nested.three.a).toEqual(6);
    expect(store.getState().four.a).toEqual(7);
  });
});
