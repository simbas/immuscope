import Lens from './Lens.js';
import {registerLensMixin} from './Registry.js';

export class BindLens extends Lens {
  shouldUpdate (state) {
    const oldValue = this.lastEvaluatedExpression;
    const value = this.expression(state);
    this.lastEvaluatedExpression = value;
    return oldValue !== value;
  }
  render (state) {
    const value = this.expression(state);
    const txt = document.createTextNode(value);
    this.element.textContent = txt.textContent;
  }
}

export default registerLensMixin('Bind', BindLens);
