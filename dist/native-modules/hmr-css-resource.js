var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
export var cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;
export function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
        throw new Error("Failed loading required CSS file: " + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
        var quote = p1.charAt(0);
        if (quote === '\'' || quote === '"') {
            p1 = p1.substr(1, p1.length - 2);
        }
        return 'url(\'' + relativeToFile(p1, address) + '\')';
    });
}
var CSSResource = /** @class */ (function () {
    function CSSResource(address) {
        this.injectedElement = null;
        this.address = address;
        this._scoped = null;
        this._global = false;
        this._alreadyGloballyInjected = false;
    }
    CSSResource.prototype.initialize = function (container, target) {
        this._scoped = new target(this);
    };
    CSSResource.prototype.register = function (registry, name) {
        if (name === 'scoped') {
            registry.registerViewEngineHooks(this._scoped);
        }
        else {
            this._global = true;
        }
    };
    CSSResource.prototype.load = function (container) {
        var _this = this;
        return container.get(Loader)
            .loadText(this.address)
            .catch(function (err) { return null; })
            .then(function (text) {
            if (!text) {
                return;
            }
            text = fixupCSSUrls(_this.address, text);
            if (_this._scoped) {
                _this._scoped.css = text;
            }
            if (_this._global) {
                _this._alreadyGloballyInjected = true;
                _this.injectedElement = DOM.injectStyles(text);
            }
        });
    };
    return CSSResource;
}());
export { CSSResource };
var CSSViewEngineHooks = /** @class */ (function () {
    function CSSViewEngineHooks(owner) {
        this.injectedElements = [];
        this.owner = owner;
        this.css = null;
    }
    CSSViewEngineHooks.prototype.beforeCompile = function (content, resources, instruction) {
        if (instruction.targetShadowDOM) {
            this.injectedElements.push(DOM.injectStyles(this.css, content, true));
        }
        else if (FEATURE.scopedCSS) {
            var styleNode = DOM.injectStyles(this.css, content, true);
            styleNode.setAttribute('scoped', 'scoped');
        }
        else if (!this.owner._alreadyGloballyInjected) {
            this.owner.injectedElement = DOM.injectStyles(this.css);
            this.owner._alreadyGloballyInjected = true;
        }
    };
    return CSSViewEngineHooks;
}());
export { CSSViewEngineHooks };
export function _createCSSResource(address) {
    var ViewCSS = /** @class */ (function (_super) {
        __extends(ViewCSS, _super);
        function ViewCSS() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ViewCSS = __decorate([
            resource(new CSSResource(address))
        ], ViewCSS);
        return ViewCSS;
    }(CSSViewEngineHooks));
    return ViewCSS;
}
