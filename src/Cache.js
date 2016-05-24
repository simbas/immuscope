let instance = null;

export default class Cache {
    constructor() {
      if (!instance) {
            instance = this;
      }
      this.cache = {};
      return instance;
    }
    push(exp, fn) {
      this.cache[exp] = fn;
    }
    get(exp) {
      if (this.cache.exp) {
        return this.cache.exp;
      } else {
        return null;
      }
    }
}
