import Abstract from './Abstract.js';
import Parser from './Parser.js';

export class Action extends Abstract {
  initialize () {
    super.initialize();
    this.type = 'action';
    this.parser = new Parser();
    this.expression = this.parse();
  }
  parse() {
    return this.parser.parseAction(this.element.getAttribute('expression'));
  }
  set scope(scope) {
    this._scope = scope;
  }
  get scope() {
    return this._scope;
  }
}
