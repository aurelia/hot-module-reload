"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/*eslint new-cap:0, padded-blocks:0*/
var aurelia_templating_1 = require("aurelia-templating");
var aurelia_loader_1 = require("aurelia-loader");
var aurelia_path_1 = require("aurelia-path");
var aurelia_pal_1 = require("aurelia-pal");
// this is almost the same as aurelia-templating-resources/css-resource
// with the exception that it keeps track of the HTMLStyleElement that is being added
exports.cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;
function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
        throw new Error("Failed loading required CSS file: " + address);
    }
    return css.replace(exports.cssUrlMatcher, function (match, p1) {
        var quote = p1.charAt(0);
        if (quote === '\'' || quote === '"') {
            p1 = p1.substr(1, p1.length - 2);
        }
        return 'url(\'' + aurelia_path_1.relativeToFile(p1, address) + '\')';
    });
}
exports.fixupCSSUrls = fixupCSSUrls;
var CSSResource = (function () {
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
        return container.get(aurelia_loader_1.Loader)
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
                _this.injectedElement = aurelia_pal_1.DOM.injectStyles(text);
            }
        });
    };
    return CSSResource;
}());
exports.CSSResource = CSSResource;
var CSSViewEngineHooks = (function () {
    function CSSViewEngineHooks(owner) {
        this.injectedElements = [];
        this.owner = owner;
        this.css = null;
    }
    CSSViewEngineHooks.prototype.beforeCompile = function (content, resources, instruction) {
        if (instruction.targetShadowDOM) {
            this.injectedElements.push(aurelia_pal_1.DOM.injectStyles(this.css, content, true));
        }
        else if (aurelia_pal_1.FEATURE.scopedCSS) {
            var styleNode = aurelia_pal_1.DOM.injectStyles(this.css, content, true);
            styleNode.setAttribute('scoped', 'scoped');
        }
        else if (!this.owner._alreadyGloballyInjected) {
            this.owner.injectedElement = aurelia_pal_1.DOM.injectStyles(this.css);
            this.owner._alreadyGloballyInjected = true;
        }
    };
    return CSSViewEngineHooks;
}());
exports.CSSViewEngineHooks = CSSViewEngineHooks;
function _createCSSResource(address) {
    var ViewCSS = (function (_super) {
        __extends(ViewCSS, _super);
        function ViewCSS() {
            return _super.apply(this, arguments) || this;
        }
        return ViewCSS;
    }(CSSViewEngineHooks));
    ViewCSS = __decorate([
        aurelia_templating_1.resource(new CSSResource(address))
    ], ViewCSS);
    return ViewCSS;
}
exports._createCSSResource = _createCSSResource;
