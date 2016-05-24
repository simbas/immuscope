import Parser from '../src/Parser.js';
import { assert } from 'chai';

describe('Parser', () => {
    it('should find top-level operands', () => {
      const evaluator = new Parser();

      const iterator = evaluator.findTokens('(test.test2 + 2) + a.b');
      let actual = [];
      for (let token of iterator) {
        actual.push(token.expression);
      }
      const expected = ['(test.test2 + 2)', 'a.b'];
      assert.deepEqual(actual, expected, 'parser finds top-level operands');
    });

    it('should not encapsulate primitive types', () => {
      const parser = new Parser();
      const expression = parser.parse('2 + 1');
      const expected = 3;
      const actual = expression();

      assert.equal(actual, expected, 'parser does not encapsulate primitive type');
    });

    it('should produce multi-context function', () => {
      const parser = new Parser();
      const expression = parser.parse('a + b + c.d + 5');
      const expected = 11;
      const actual = expression([{a: 1, b: 2, c: {d: 3}}, {c: 5}]);

      assert.equal(actual, expected, 'parser produces multi-context function');
    });

    it('should parse action', () => {
      const parser = new Parser();
      const action = parser.parseAction('{title: "todo", done: false} -> addTodo');
      const expected = {mutationName: 'addTodo', payload: {title: 'todo', done: false}};
      const actual = action;
      assert.equal(actual.mutationName, expected.mutationName, 'parser does parse mutationName');
      assert.deepEqual(actual.actionExp(), expected.payload, 'parser does parse actionExp');

    });
});
