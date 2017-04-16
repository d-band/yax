import expect from 'expect';
import yax from '../src/index';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('basic', () => {
  it('basic module', (done) => {
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
  it('basic select', () => {
    const store = yax({
      state: 1,
      reducers: {
        addDone (state, payload) {
          return state + payload;
        },
        minusDone (state, payload) {
          return state - payload;
        }
      },
      actions: {
        add ({ commit, select }) {
          const v = select(state => state);
          commit('addDone', v);
        },
        minus ({ commit, select }) {
          const v = select(state => state);
          commit('minusDone', v);
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

    expect(store.getState()).toEqual(1);
  });
});
