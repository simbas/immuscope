let instance = null;

export default class Registry {
  constructor () {
    if (!instance) {
          instance = this;
    }
    this.Lenses = {};
    this.Actions = {};
    this.scopes = [];
    this.lenses = [];
    this.actions = [];
    return instance;
  }
  registerLensClass(directiveName, Directive) {
    this.Lenses[directiveName] = Directive;
  }
  registerActionClass(directiveName, Directive) {
    this.Actions[directiveName] = Directive;
  }
  registerScope(scope) {
    this.scopes.push(scope);
  }
  registerLens(lens) {
    this.lenses.push(lens);
  }
  registerAction(action) {
    this.actions.push(action)
  }
}

export const registerLensMixin = function (lensName, LensClass) {
  const registry = new Registry();
  const MixedLensClass = class extends LensClass {
    constructor(...args) {
      super(...args);
      registry.registerLens(this);
    }
  }
  registry.registerLensClass(lensName, MixedLensClass);
  return MixedLensClass;
}

export const registerActionMixin = function (actionName, ActionClass) {
  const registry = new Registry();
  const MixedActionClass = class extends ActionClass {
    constructor(...args) {
      super(...args);
      registry.registerAction(this);
    }
  }
  registry.registerActionClass(actionName, MixedActionClass);
  return MixedActionClass;
}

export const registerScopeMixin = function (ScopeClass) {
  const registry = new Registry();
  const MixedScopeClass = class extends ScopeClass {
    constructor(...args) {
      super(...args);
      registry.registerScope(this);
    }
  }
  return MixedScopeClass;
}
