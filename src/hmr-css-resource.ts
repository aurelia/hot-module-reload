/*eslint new-cap:0, padded-blocks:0*/
import {ViewResources, resource, ViewCompileInstruction} from 'aurelia-templating';
import {Loader} from 'aurelia-loader';
import {Container} from 'aurelia-dependency-injection';
import {relativeToFile} from 'aurelia-path';
import {DOM, FEATURE} from 'aurelia-pal';

// this is almost the same as aurelia-templating-resources/css-resource
// with the exception that it keeps track of the HTMLStyleElement that is being added

export let cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

export function fixupCSSUrls(address: string, css: string) {
  if (typeof css !== 'string') {
    throw new Error(`Failed loading required CSS file: ${address}`);
  }
  return css.replace(cssUrlMatcher, (match, p1) => {
    let quote = p1.charAt(0);
    if (quote === '\'' || quote === '"') {
      p1 = p1.substr(1, p1.length - 2);
    }
    return 'url(\'' + relativeToFile(p1, address) + '\')';
  });
}

export class CSSResource {
  address: string;
  _scoped: CSSViewEngineHooks | null;
  _global: boolean;
  _alreadyGloballyInjected: boolean;
  injectedElement: HTMLStyleElement | null = null;

  constructor(address: string) {
    this.address = address;
    this._scoped = null;
    this._global = false;
    this._alreadyGloballyInjected = false;
  }

  initialize(container: Container, target: typeof CSSViewEngineHooks): void {
    this._scoped = new target(this);
  }

  register(registry: ViewResources, name?: string): void {
    if (name === 'scoped') {
      registry.registerViewEngineHooks(this._scoped as CSSViewEngineHooks);
    } else {
      this._global = true;
    }
  }

  load(container: Container): Promise<void> {
    return (container.get(Loader) as Loader)
      .loadText(this.address)
      .catch((err: any) => null)
      .then(text => {
        if (!text) {
          return;
        }
        text = fixupCSSUrls(this.address, text);
        if (this._scoped) {
          this._scoped.css = text;
        }
        if (this._global) {
          this._alreadyGloballyInjected = true;
          this.injectedElement = DOM.injectStyles(text) as HTMLStyleElement;
        }
      });
  }
}

export class CSSViewEngineHooks {
  owner: CSSResource;
  css: string | null;
  injectedElements: HTMLStyleElement[] = [];

  constructor(owner: CSSResource) {
    this.owner = owner;
    this.css = null;
  }

  beforeCompile(content: DocumentFragment, resources: ViewResources, instruction: ViewCompileInstruction): void {
    if (instruction.targetShadowDOM) {
      this.injectedElements.push(
        DOM.injectStyles(this.css as string, content as any, true) as HTMLStyleElement
      );
    } else if (FEATURE.scopedCSS) {
      let styleNode = DOM.injectStyles(this.css as string, content as any, true) as HTMLStyleElement;
      styleNode.setAttribute('scoped', 'scoped');
    } else if (!this.owner._alreadyGloballyInjected) {
      this.owner.injectedElement = DOM.injectStyles(this.css as string) as HTMLStyleElement;
      this.owner._alreadyGloballyInjected = true;
    }
  }
}

export function _createCSSResource(address: string): Function {
  @resource(new CSSResource(address))
  class ViewCSS extends CSSViewEngineHooks {}
  return ViewCSS;
}
