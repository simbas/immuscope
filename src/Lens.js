import Abstract from './Abstract.js';
import Parser from './Parser.js';

export default class Lens extends Abstract {
  initialize () {
    super.initialize();
    this.type = 'lens';
    this.parser = new Parser();
    this.expression = this.parse();
  }
  render () {
  }
  update (state) {
    if (this.shouldUpdate(state)) {
      const rect = this.element.getBoundingClientRect();
      const isVisible = (rect.top >= 0 && rect.left >= 0 &&
                          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                          rect.right <= (window.innerWidth || document.documentElement.clientWidth));
      if (isVisible) {
        this.render(state);
      } else {
        window.setTimeout(() => this.render(state), 0);
      }
    }
  }
  set scope(scope) {
    this._scope = scope;
  }
  get scope() {
    return this._scope;
  }
  parse () {
    return this.parser.parse(this.element.getAttribute('expression'));
  }
  shouldUpdate () {
    return true;
  }
}
