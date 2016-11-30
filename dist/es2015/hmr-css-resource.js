var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/*eslint new-cap:0, padded-blocks:0*/
import { resource } from 'aurelia-templating';
import { Loader } from 'aurelia-loader';
import { relativeToFile } from 'aurelia-path';
import { DOM, FEATURE } from 'aurelia-pal';
// this is almost the same as aurelia-templating-resources/css-resource
// with the exception that it keeps track of the HTMLStyleElement that is being added
export let cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;
export function fixupCSSUrls(address, css) {
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
    constructor(address) {
        this.injectedElement = null;
        this.address = address;
        this._scoped = null;
        this._global = false;
        this._alreadyGloballyInjected = false;
    }
    initialize(container, target) {
        this._scoped = new target(this);
    }
    register(registry, name) {
        if (name === 'scoped') {
            registry.registerViewEngineHooks(this._scoped);
        }
        else {
            this._global = true;
        }
    }
    load(container) {
        return container.get(Loader)
            .loadText(this.address)
            .catch((err) => null)
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
                this.injectedElement = DOM.injectStyles(text);
            }
        });
    }
}
export class CSSViewEngineHooks {
    constructor(owner) {
        this.injectedElements = [];
        this.owner = owner;
        this.css = null;
    }
    beforeCompile(content, resources, instruction) {
        if (instruction.targetShadowDOM) {
            this.injectedElements.push(DOM.injectStyles(this.css, content, true));
        }
        else if (FEATURE.scopedCSS) {
            let styleNode = DOM.injectStyles(this.css, content, true);
            styleNode.setAttribute('scoped', 'scoped');
        }
        else if (!this.owner._alreadyGloballyInjected) {
            this.owner.injectedElement = DOM.injectStyles(this.css);
            this.owner._alreadyGloballyInjected = true;
        }
    }
}
export function _createCSSResource(address) {
    let ViewCSS = class ViewCSS extends CSSViewEngineHooks {
    };
    ViewCSS = __decorate([
        resource(new CSSResource(address))
    ], ViewCSS);
    return ViewCSS;
}
