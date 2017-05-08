import expect from 'expect';
import yax, { combineReducers, applyMiddleware, composeReducers } from '../src/index';

describe('enhancer', () => {
  it('enhancer basic', () => {
    const enhancer = (createStore) => (reducer, preloadedState, enhancer) => {
      const counter = (state = 0, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return state + 1;
          case 'DECREMENT':
            return state - 1;
          default:
            return state;
        }
      };
      return createStore(composeReducers(
        reducer,
        combineReducers({ counter })
      ), preloadedState, enhancer);
    };
    const store = yax({
      actions: {
        async add ({ dispatch }) {
          await dispatch({
            type: 'INCREMENT'
          }, true);
          await dispatch({
            type: 'INCREMENT'
          }, true);
          await dispatch({
            type: 'DECREMENT'
          }, true);
        }
      }
    }, enhancer);

    store.dispatch({ type: 'add' });
    expect(store.getState().counter).toEqual(1);
  });

  it('enhancer applyMiddleware', (done) => {
    const thunk = ({ dispatch, getState }) => next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return next(action);
    };
    const getPayload = () => Promise.resolve(2);
    const addSync = (dispatch) => {
      return getPayload().then(payload => {
        return dispatch({
          type: 'add',
          payload
        });
      });
    };
    const store = yax({
      state: 1,
      reducers: {
        add (state, payload) {
          return state + payload;
        }
      },
      actions: {
        async addSync ({ dispatch }) {
          await addSync(dispatch);
        }
      }
    }, applyMiddleware(thunk));

    store.dispatch(addSync);
    store.dispatch({ type: 'addSync' });

    setTimeout(() => {
      expect(store.getState()).toEqual(5);
      done();
    }, 10);
  });
});
