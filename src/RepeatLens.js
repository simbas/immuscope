import Lens from './Lens.js';
import {registerLensMixin} from './Registry.js';
import {childScriptParserMixin} from './Mixins.js';
import Scope from './Scope.js';
import Bootstrapper from './Bootstrapper.js';

export class RepeatLens extends Lens {
  initialize () {
    super.initialize();
    const scripts = this.parseChildScript();
    if(typeof scripts.fragment !== 'undefined' && scripts.fragment.length > 0) {
      const template = scripts.fragment[0].content;
      let range = document.createRange();
      range.selectNode(this.element);
      this.templateNode = range.createContextualFragment(template);
      this.weakMap = new WeakMap();
    }
  }
  shouldUpdate (state) {
    const oldValue = this.lastEvaluatedExpression;
    const value = this.expression.propertyExpression(state);
    this.lastEvaluatedExpression = value;
    return oldValue !== value;
  }
  parse () {
    const [elementName, property] = this.element.getAttribute('expression').split(' of ');
    const propertyExpression = this.parser.parse(property);
    return {elementName, propertyExpression};
  }
  render  (state) {
    const treeWalker = document.createTreeWalker(this.element);
    const property = this.expression.propertyExpression(state);
    const propertyWalker = property.map((item) => {return {item: item, visited: false, firstNode: null, lastNode: null}});
    let currentPropertyIndex;
    const blackMarkedNodes = [];
    while (treeWalker.nextNode()) {
      if (this.weakMap.has(treeWalker.currentNode)) {
        const currentScope = this.weakMap.get(treeWalker.currentNode);
        const currentStore = currentScope.store;
        currentPropertyIndex = currentStore._state.$index;
        if (currentPropertyIndex >= property.length) {
          blackMarkedNodes.push(treeWalker.currentNode);
        } else {
          const currentNewState = currentStore.clone(property[currentPropertyIndex]);
          currentNewState.$index = currentPropertyIndex;
          currentScope.store.state = currentNewState;
          currentScope.update();
          propertyWalker[currentPropertyIndex].visited = true;
          if(propertyWalker[currentPropertyIndex].firstNode === null) {
            propertyWalker[currentPropertyIndex].firstNode = treeWalker.currentNode;
          }
          propertyWalker[currentPropertyIndex].lastNode = treeWalker.currentNode;
        }
      }
    }

    for (const node of blackMarkedNodes) {
      this.element.removeChild(node);
    }

    if (typeof currentPropertyIndex === 'undefined') {
      currentPropertyIndex = 0;
    } else {
      currentPropertyIndex++;
    }
    for (let idx = 0; idx < propertyWalker.length; idx++) {
      const walking = propertyWalker[idx];
      if (!walking.visited) {
        const itemFragment = this.templateNode.cloneNode(true);
        const itemNodes = [].slice.call(itemFragment.childNodes, 0);

        let nextNode = null;
        if (idx < propertyWalker.length - 1) {
          const nextNode = propertyWalker[idx+1].firstNode;
        }
        this.element.insertBefore(itemFragment, nextNode);

        for (const node of itemNodes) {
          if(node.nodeType === 1) {
            const itemData = Object.assign({}, walking.item);
            if (typeof itemData.$index === 'undefined') {
              itemData.$index = idx;
            }
            const scope = new Scope(node, itemData, {});
            scope.parent = this.scope;
            new Bootstrapper(node, scope);
            this.weakMap.set(node, scope);
          }
        }
      }
    }
  }
}

export default registerLensMixin('Repeat', RepeatLens);
