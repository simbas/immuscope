import BindLens from './BindLens.js';
import RepeatLens from './RepeatLens.js';
import ClickAction from './ClickAction.js';
import Scope from './Scope.js';
import Registry from './Registry.js';

export default class Bootstrapper {
    constructor (el, elScope) {
      let lenses = [];
      let actions = [];
      let scopes = [];

      const registry = new Registry();
      for (const LensName in registry.Lenses) {
        const lensElements = el.querySelectorAll('['+ LensName.toLowerCase() + ']');
        for (const lensElement of lensElements) {
          const LensClass = registry.Lenses[LensName];
          lenses.push(new LensClass(lensElement));
        }
      }

      for (const ActionName in registry.Actions) {
        const actionElements = el.querySelectorAll('['+ ActionName.toLowerCase() + ']');
        for (const actionElement of actionElements) {
          const ActionClass = registry.Actions[ActionName];
          actions.push(new ActionClass(actionElement));
        }
      }

      const scopeElements = el.querySelectorAll('[scope]');
      for(const scopeElement of scopeElements) {
        scopes.push(new Scope(scopeElement));
      }

      class Node {
        constructor (piece) {
          this.children = [];
          this.piece = piece;
        }
        push (node) {
          this.children.push(node);
        }
        clear () {
          this.children = [];
        }
      }

      const pieces = lenses.concat(scopes).concat(actions);

      const nodes = pieces.map(piece => new Node(piece));

      for (const node of nodes) {
        for(const comparingNode of nodes) {
          const bitmask = node.piece.element.compareDocumentPosition(comparingNode.piece.element);
          const Node = window.Node;
          if(!!(bitmask & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            node.push(comparingNode);
          }
        }
      }

      nodes.sort(function (a, b) {
        if(a.children.length < b.children.length) {
          return 1;
        }
        if(a.children.length === b.children.length) {
          return 0;
        }
        if(a.children.length > b.children.length) {
          return -1;
        }
      });

      nodes.forEach(node => node.clear());

      const tree = new Node(null);


      function attachNode (node, currentNode) {
        if (currentNode.children.length === 0) {
          currentNode.push(node);
        } else {
          let attached = false;
          let index = 0;
          while(index < currentNode.children.length && !attached) {
            const currentChild = currentNode.children[index];

            const bitmask = node.piece.element.compareDocumentPosition(currentChild.piece.element);
            const Node = window.Node;
            if(!!(bitmask & Node.DOCUMENT_POSITION_CONTAINS)) {
              attachNode(node, currentChild);
              attached = true;
            }
            index++;
          }
          if(!attached) {
            currentNode.push(node);
          }
        }
      }

      if (typeof elScope !== 'undefined') {
        const elScopeNode = new Node(elScope);
        tree.push(elScopeNode);
        for (const node of nodes) {
          attachNode(node, elScopeNode);
        }
      } else {
        for (const node of nodes) {
          attachNode(node, tree);
        }
      }

      function flattenByScope (node) {
        const flattenChildren = node.children.map(child => flattenByScope(child));
        node.clear();
        for(const child of flattenChildren) {
          if(child.piece.type !== 'scope') {
            for(const ch of child.children) {
              node.push(ch);
            }
            node.push(child);
          } else {
            node.push(child);
          }
        }
        return node;
      }

      const flattenTree = flattenByScope(tree);

      function attachScopeChildren (node) {
        if(node.piece.type === 'scope') {
          for(const child of node.children) {
            if(child.piece.type === 'scope') {
              attachScopeChildren(child)
            }
            node.piece.attach(child.piece);
          }
        }
      }

      flattenTree.children.forEach(node => attachScopeChildren(node));

      for(const child of tree.children) {
        if(child.piece.type === 'scope') {
          child.piece.update();
        }
      }

      this.tree = tree;
    }
}
