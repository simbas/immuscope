import Store from '../src/Store.js';
import { assert } from 'chai';

describe('Store', () => {
    it('should freeze the state', () => {
      const store = new Store({a: 1, b: 2});
      assert.frozen(store.state);
    });
    it('should mutate the state', () => {
      function addA (nextState) {
        nextState.a++;
        return nextState;
      }
      const store = new Store({a: 1, b: 2}, {addA});
      store.mutate('addA');
      assert.frozen(store.state);
      assert.equal(store.state.a, 2);
    });
});
