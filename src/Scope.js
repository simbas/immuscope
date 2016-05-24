import Abstract from './Abstract.js';
import {registerScopeMixin} from './Registry.js';
import Store from './Store.js';
import {childScriptParserMixin} from './Mixins.js';

class Scope extends Abstract {
  initialize (state, mutations) {
    super.initialize();
    this.type = 'scope';
    this.lenses = [];
    this.actions = [];
    this.scopes = [];

    if (typeof state === 'undefined' || typeof mutations === 'undefined') {
      mutations = {};
      const scripts = this.parseChildScript();
      if(typeof scripts.state !== 'undefined' && scripts.state.length > 0) {
        state = scripts.state[0].content;
      }
      if(typeof scripts.mutation !== 'undefined' && scripts.mutation.length > 0) {
        scripts.mutation.forEach(mutation => mutations[mutation.name] = mutation.content);
      }
    }

    this.store = new Store(state, mutations);
    this.store.addObserver(this);
  }
  get stores() {
    if(typeof this.parent === 'undefined') return [this.store];
    return [this.store].concat(this.parent.stores);
  }
  get contexts() {
    return this.stores.map((store) => store.state);
  }
  mutate(mutationName, payload) {
    if (typeof this.store.mutations[mutationName] === 'undefined') {
      if (typeof this.parent === 'undefined') {
        throw new Error(`mutation ${mutationName} not found.`);
      } else {
        this.parent.mutate(mutationName, payload);
      }
    } else {
      this.store.mutate(mutationName, payload);
    }
  }
  set parentScope(parent) {
    this.parent = parent;
  }
  update () {
    for(const lens of this.lenses) {
      lens.update(this.contexts);
    }
    for(const scope of this.scopes) {
      scope.update();
    }
  }
  attach(child) {
    switch (child.type) {
      case 'scope': {
        child.parent = this;
        this.scopes.push(child);
      } break;
      case 'lens': {
        this.lenses.push(child);
        child.scope = this;
      } break;
      case 'action': {
        this.actions.push(child);
        child.scope = this;
      } break;
    }
  }
}

export default registerScopeMixin(Scope);
