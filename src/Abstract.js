export default class Abstract {
    constructor(element, ...args) {
      this.element = element;
      this.initialize(...args);
    }
    initialize() {
      this.type = 'abstract';
    }
    parseChildScript () {
      if(typeof this.element === 'undefined') throw new Error('element is not defined');

      function toJS (body) {
        const fn = new Function(`return ${body.trim()}`);
        return fn();
      }

      let result = {};

      let child = this.element.firstElementChild;
      while (child !== null && child.tagName.toLowerCase() === 'script') {
        const type = child.getAttribute('type');
        const [mainType, subType] = type.split('/');
        if (mainType === 'immuscope') {
          if(typeof result[subType] === 'undefined') {
            result[subType] = [];
          }
          let script = {content: toJS(child.textContent)};
          const name = child.getAttribute('name');
          if(typeof name !== 'undefined') {
            script.name = name;
          }
          result[subType].push(script);
        }
        child = child.nextElementSibling;
      }
      return result;
    }
}
