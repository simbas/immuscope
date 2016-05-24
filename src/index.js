import 'babel-polyfill';

import Bootstrapper from './Bootstrapper.js';
import History from './History.js';
import Registry from './Registry.js';

export default class T {
    constructor (el) {
      new Bootstrapper(el);
      this.history = new History();
      this.registry = new Registry();
    }
    rewind () {
      this.history.rewind();
    }
    fastforward () {
      this.history.fastforward();
    }
}
window.T = T;
