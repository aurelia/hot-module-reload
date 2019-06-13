System.register(["aurelia-templating", "aurelia-loader", "aurelia-path", "aurelia-pal"], function (exports_1, context_1) {
    "use strict";
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
    var aurelia_templating_1, aurelia_loader_1, aurelia_path_1, aurelia_pal_1, cssUrlMatcher, CSSResource, CSSViewEngineHooks;
    var __moduleName = context_1 && context_1.id;
    function fixupCSSUrls(address, css) {
        if (typeof css !== 'string') {
            throw new Error("Failed loading required CSS file: " + address);
        }
        return css.replace(cssUrlMatcher, function (match, p1) {
            var quote = p1.charAt(0);
            if (quote === '\'' || quote === '"') {
                p1 = p1.substr(1, p1.length - 2);
            }
            return 'url(\'' + aurelia_path_1.relativeToFile(p1, address) + '\')';
        });
    }
    exports_1("fixupCSSUrls", fixupCSSUrls);
    function _createCSSResource(address) {
        var ViewCSS = /** @class */ (function (_super) {
            __extends(ViewCSS, _super);
            function ViewCSS() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ViewCSS = __decorate([
                aurelia_templating_1.resource(new CSSResource(address))
            ], ViewCSS);
            return ViewCSS;
        }(CSSViewEngineHooks));
        return ViewCSS;
    }
    exports_1("_createCSSResource", _createCSSResource);
    return {
        setters: [
            function (aurelia_templating_1_1) {
                aurelia_templating_1 = aurelia_templating_1_1;
            },
            function (aurelia_loader_1_1) {
                aurelia_loader_1 = aurelia_loader_1_1;
            },
            function (aurelia_path_1_1) {
                aurelia_path_1 = aurelia_path_1_1;
            },
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            }
        ],
        execute: function () {
            // this is almost the same as aurelia-templating-resources/css-resource
            // with the exception that it keeps track of the HTMLStyleElement that is being added
            exports_1("cssUrlMatcher", cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi);
            CSSResource = /** @class */ (function () {
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
            exports_1("CSSResource", CSSResource);
            CSSViewEngineHooks = /** @class */ (function () {
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
            exports_1("CSSViewEngineHooks", CSSViewEngineHooks);
        }
    };
});
