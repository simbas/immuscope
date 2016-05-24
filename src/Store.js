import {historyMixin} from './History.js';

export class Store {
  constructor (state, mutations) {
    this.mutations = Object.freeze(mutations);
    this._state = state;
    this._cache = null;
    this.observers = new Set();
  }
  addObserver (observer) {
    this.observers.add(observer);
  }
  notifyObservers () {
    this.observers.forEach(observer => observer.update(this));
  }
  get state () {
    if(this._cache !== null) {
      return this._cache;
    }
    this._cache = this.freeze(this._state);
    return this._cache;
  }
  set state (nextState) {
    this._state = nextState;
    this._cache = null;
    this.notifyObservers();
  }
  mutate (mutationName, ...args) {
    const mutation = this.mutations[mutationName];
    const nextState = mutation(this.clone(this.state), ...args);
    this.state = nextState;
  }
  freeze (obj) {
    const propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach((name) => {
      const prop = obj[name];
      if (typeof prop == 'object' && prop !== null && !Object.isFrozen(prop))
        this.freeze(prop);
    });
    return Object.freeze(obj);
  }
  clone (obj) {
    if (Array.isArray(obj)) {
      let clonedArr = obj.map((item) => {
        if (typeof item == 'object' && item !== null) {
          return this.clone(item);
        }
        return item;
      });
      return Object.assign([], clonedArr);
    } else {
      const propNames = Object.getOwnPropertyNames(obj);
      let clonedObj = {};
      propNames.forEach((name) => {
        const prop = obj[name];
        if (typeof prop == 'object' && prop !== null)
          clonedObj[name] = this.clone(prop);
      });
      return Object.assign({}, obj, clonedObj);
    }
  }
}

export default historyMixin(Store);
