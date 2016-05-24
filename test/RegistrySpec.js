import Registry from '../src/Registry.js';
import {registerScopeMixin, registerLensMixin} from '../src/Registry.js';
import { assert } from 'chai';

describe('Registry', () => {
    it('should register via mixins', () => {
      class SuperClass {
        constructor (element) {
          this.element = element;
        }
      }

      const TestLensMixin = registerLensMixin('Test', SuperClass);
      const testLensMixin = new TestLensMixin('a');

      const TestScopeMixin = registerScopeMixin(SuperClass);
      const testScopeMixin = new TestScopeMixin('a');

      const registry = new Registry();
      assert.equal(registry.Lenses['Test'], TestLensMixin);
      assert.equal(registry.lenses[0], testLensMixin);
      assert.equal(registry.scopes[0], testScopeMixin);
    });
});
