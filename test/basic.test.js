import expect from 'expect';
import yax from '../src/index';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('basic', () => {
  it('basic', (done) => {
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
});
