export const childScriptParserMixin = function (SuperClass) {
  return class extends SuperClass {
    parseChildScript () {
      if(typeof this.element === 'undefined') throw new Error('element is not defined');

      function toJS (body) {
        const fn = new Function(`return ${body.trim()}`);
        return fn();
      }

      let result = {};

      const children = [].slice.call(this.element.children);

      for (const child of children) {
        if(child.tagName.toLowerCase() === 'script') {
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
        }
      }
      return result;
    }
  }
}
