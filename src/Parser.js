import Cache from './Cache.js';

export default class Parser {
  constructor() {
    this.cache = new Cache();
  }
  parseTokenExpression (exp) {
    const hit = this.cache.get(exp);
    if(hit) return hit;

    const fn = new Function('ctxs', `
      for(var i = 0, ctx; i < ctxs.length; i++) {
        ctx = ctxs[i];
        if (typeof ctx.${exp} !== 'undefined') {
          return ctx.${exp};
        }
      }`);

    this.cache.push(exp, fn);
    return fn;
  }
  *findTokens(exp) {
    let inSingle = false;
    let inDouble = false;
    let curly = 0;
    let square = 0;
    let paren = 0;
    let c, prev;
    let aggratingToken = '';
    let start = 0;
    let end = 0;
    const operators = ['=', '&', '|', ';', '+', '-'].map(c => c.charCodeAt(0));
    let charIdx;
    for (charIdx = 0; charIdx < exp.length; charIdx++) {
      c = exp.charCodeAt(charIdx);
      prev = c;
      if(inSingle) {
        if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
      } else if (inDouble) {
        if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble
      } else {
        switch (c) {
          case 0x22: inDouble = true; break // "
          case 0x27: inSingle = true; break // '
          case 0x28: paren++; break         // (
          case 0x29: paren--; break         // )
          case 0x5B: square++; break        // [
          case 0x5D: square--; break        // ]
          case 0x7B: curly++; break         // {
          case 0x7D: curly--; break         // }
        }
      }
      if (operators.indexOf(c) > -1 && !inDouble && !inSingle && paren === 0 && square === 0 && curly === 0) {
        yield {start: start, end: charIdx - 1, expression: aggratingToken.trim()};
        aggratingToken = '';
        start = null;
      } else {
        if (start === null) {
          start = charIdx;
        }
        aggratingToken += exp[charIdx];
      }
    }
    if (aggratingToken.length > 0) {
      yield {start: start, end: charIdx, expression: aggratingToken.trim()};
    }
  }
  multiplyContext (rawExp) {
    let exp = rawExp;
    let newExp = '';
    let index = 0;
    for (const token of this.findTokens(exp)) {
      let tokenSubstring = exp.substring(token.start, token.end);
      if (/^[a-zA-Z_$]/g.test(token.expression)) {
        tokenSubstring = tokenSubstring.replace(token.expression, this.parseTokenExpression(token.expression)+'(ctxs)');
      }
      newExp += exp.substring(index, token.start) + tokenSubstring;
      index= token.end + 1;
    }
    return newExp;
  }
  parse (exp) {
    const hit = this.cache.get(exp);
    if(hit) return hit;

    const multipliedContextExp = this.multiplyContext(exp);
    const fn = new Function('ctxs', `return (${multipliedContextExp});`);
    this.cache.push(exp, fn);
    return fn;
  }
  parseAction (exp) {
    const hit = this.cache.get(exp);
    if(hit) return hit;

    const [actionExp, mutationName] = exp.split('->');
    const action = {actionExp: this.parse(actionExp), mutationName: mutationName.trim()}
    return action;

  }
}
