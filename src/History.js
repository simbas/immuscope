export class Stack {
  constructor(maxLength = 0) {
    this.data = [];
    this.maxLength = maxLength;
  }
  clear() {
    this.data = [];
  }
  push (item) {
    this.data.unshift(item);
    if (this.maxLength !== 0 && this.data.length > this.maxLength) {
      while(this.data.length > this.maxLength) {
        this.data.pop();
      }
    }
  }
  pop () {
    return this.data.pop();
  }
  shift () {
    return this.data.shift();
  }
  last () {
    return this.data[0];
  }
  get length () {
    return this.data.length;
  }
}

let instance = null;

export default class History {
  constructor () {
    if (!instance) {
      instance = this;
    }
    this.stack = new Stack(50);
    this.rewindStack = new Stack(25);
    return instance;
  }
  push(store, state, actionName, actionArgs) {
    const date = new Date();
    this.stack.push({state: state, store: store, date: date.getTime(), actionName: actionName, actionArgs: actionArgs});
    this.rewindStack.clear();
  }
  rewind () {
    if (this.stack.length <= 1) {
      return;
    }
    const removedHistoryEntry = this.stack.shift();
    this.rewindStack.push(removedHistoryEntry);
    const lastHistoryEntry = this.stack.last();
    lastHistoryEntry.store.state = lastHistoryEntry.state;
  }
  fastforward () {
    if (this.rewindStack.length === 0) {
      return;
    }
    const lastHistoryEntry = this.rewindStack.shift();
    this.stack.push(lastHistoryEntry);
    lastHistoryEntry.store.state = lastHistoryEntry.state;
  }
}

export const historyMixin = function (StoreClass) {
  const history = new History();
  const MixedStoreClass = class extends StoreClass {
    constructor(...args) {
      super(...args);
      if(Object.keys(this.mutations).length > 0) history.push(this, this._state, 'constructor', []);
    }
    mutate(actionName, ...args) {
      super.mutate(actionName, ...args);
      if(Object.keys(this.mutations).length > 0) history.push(this, this._state, actionName, args);
    }
  }
  return MixedStoreClass;
}
