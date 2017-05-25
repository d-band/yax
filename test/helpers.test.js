import expect from 'expect';
import yax, { mapState, mapActions } from '../src/index';
import { count, delay } from './count';

describe('helpers', () => {
  it('helpers basic', (done) => {
    const nested = {
      state: {},
      modules: {
        bar: {
          state: { val: 2 }
        }
      }
    };
    const store = yax({
      state: {
        foo: 1,
        bar: 1
      },
      modules: { count, nested },
      reducers: {
        addFooDone (state, payload) {
          const foo = state.foo + payload;
          return { ...state, foo };
        },
        addBarDone (state, payload) {
          const bar = state.bar + payload;
          return { ...state, bar };
        }
      },
      actions: {
        async addFoo ({ commit }, payload) {
          await delay(1);
          commit('addFooDone', payload);
        },
        async addBar ({ commit }, payload) {
          await delay(1);
          commit('addBarDone', payload);
        }
      }
    });

    const fn1 = mapActions({
      add: 'count/add',
      minus: 'count/minus'
    })(store.dispatch);
    const fn2 = mapActions('count', ['add', 'minus'])(store.dispatch);
    const fn3 = mapActions({
      foo: 'addFoo',
      bar: 'addBar'
    })(store.dispatch);

    fn1.add(5);
    fn1.minus(3);
    fn2.add(5);
    fn2.minus(2);
    fn3.foo(3);
    fn3.bar(2);

    setTimeout(() => {
      const s1 = mapState({
        f: 'foo',
        b: 'bar',
        c: 'count'
      })(store.getState());
      const s2 = mapState(['foo', 'bar', 'count'])(store.getState());
      const s3 = mapState('nested/bar', { bar: 'val' })(store.getState());
      expect(s1.f).toEqual(4);
      expect(s1.b).toEqual(3);
      expect(s1.c).toEqual(5);
      expect(s2.foo).toEqual(4);
      expect(s2.bar).toEqual(3);
      expect(s2.count).toEqual(5);
      expect(s3.bar).toEqual(2);
      done();
    }, 10);
  });
});
