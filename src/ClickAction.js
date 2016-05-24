import {Action} from './Action.js';
import {registerActionMixin} from './Registry.js';

export class ClickAction extends Action {
  initialize (...args) {
    super.initialize(...args);
    this.element.addEventListener('click', e => {
      this.scope.mutate(this.expression.mutationName, this.expression.actionExp(this.scope.contexts));
    });
  }
}

export default registerActionMixin('Click', ClickAction);
