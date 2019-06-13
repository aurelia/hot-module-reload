var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "aurelia-pal", "aurelia-metadata", "aurelia-templating", "aurelia-dependency-injection", "./hmr-css-resource", "./view-model-traverse-controller", "./view-traverse-controller", "./render-utils"], function (require, exports, aurelia_pal_1, aurelia_metadata_1, aurelia_templating_1, aurelia_dependency_injection_1, hmr_css_resource_1, view_model_traverse_controller_1, view_traverse_controller_1, render_utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UndefinedResourceModule = { id: null, mainResource: { metadata: {}, value: undefined } };
    function getAuElements() {
        return Array.from(aurelia_pal_1.DOM.querySelectorAll('.au-target'));
    }
    exports.getAuElements = getAuElements;
    function getControllersWithClassInstances(oldPrototype) {
        var _a, _b;
        // get visible elements to re-render:
        var auElements = getAuElements();
        /* NOTE: viewless components like blur-image do not have el.au.controller set */
        var controllersLists = auElements.map(function (el) { return el.au && Object.values(el.au) || []; });
        // list of unique controllers
        var controllers = Array.from(new Set((_a = []).concat.apply(_a, controllersLists)));
        var previouslyTraversed = new Set();
        var traversalInfo = (_b = []).concat.apply(_b, controllers.map(function (parentController) {
            return view_model_traverse_controller_1.traverseController(oldPrototype, parentController, {
                previouslyTraversed: previouslyTraversed,
                parentController: parentController
            });
        }));
        return traversalInfo;
    }
    exports.getControllersWithClassInstances = getControllersWithClassInstances;
    var HmrContext = /** @class */ (function () {
        function HmrContext(loader) {
            var _this = this;
            this.loader = loader;
            this.viewEngine = aurelia_dependency_injection_1.Container.instance.get(aurelia_templating_1.ViewEngine);
            this.moduleAnalyzerCache = this.viewEngine.moduleAnalyzer.cache;
            var styleResourcePlugin = {
                fetch: function (moduleId) {
                    var _a;
                    return _a = {},
                        _a[moduleId] = hmr_css_resource_1._createCSSResource(moduleId),
                        _a;
                },
                hot: function (moduleId) {
                    _this.reloadCss(moduleId);
                }
            };
            ['.css', '.less', '.sass', '.scss', '.styl'].forEach(function (ext) { return _this.viewEngine.addResourcePlugin(ext, styleResourcePlugin); });
        }
        /**
         * Handles ViewModel changes
         */
        HmrContext.prototype.handleModuleChange = function (moduleId, hot) {
            return __awaiter(this, void 0, void 0, function () {
                var previousModule, newModule, oldResourceModule, newResourceModule, origin_1, normalizedId, moduleMember, keys;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            previousModule = this.loader.moduleRegistry[moduleId];
                            if (!previousModule) {
                                return [2 /*return*/];
                            }
                            console.log("Running default HMR for " + moduleId);
                            // reload fresh module:
                            delete this.loader.moduleRegistry[moduleId];
                            return [4 /*yield*/, this.loader.loadModule(moduleId)];
                        case 1:
                            newModule = _a.sent();
                            oldResourceModule = this.moduleAnalyzerCache[moduleId];
                            if (oldResourceModule) {
                                origin_1 = aurelia_metadata_1.Origin.get(newModule);
                                normalizedId = origin_1.moduleId;
                                moduleMember = origin_1.moduleMember;
                                newResourceModule = this.viewEngine.moduleAnalyzer.analyze(normalizedId, newModule, moduleMember);
                                if (!newResourceModule.mainResource && !newResourceModule.resources) {
                                    hot.decline(moduleId);
                                    return [2 /*return*/];
                                }
                                if (newResourceModule.mainResource) {
                                    newResourceModule.initialize(this.viewEngine.container);
                                }
                                // monkey patch old resource module:
                                // would be better to simply replace it everywhere
                                Object.assign(oldResourceModule, newResourceModule);
                            }
                            // TODO: kinda CompositionEngine.ensureViewModel()
                            // TODO: to replace - use closest container: childContainer.get(viewModelResource.value);
                            if (previousModule instanceof Object) {
                                keys = Object.keys(previousModule);
                                keys.forEach(function (key) {
                                    var newExportValue = newModule[key];
                                    if (!newExportValue) {
                                        return;
                                    }
                                    var previousExportValue = previousModule[key];
                                    var type = typeof previousExportValue;
                                    if (type === 'function' || type === 'object') {
                                        // these are the only exports we can reliably replace (classes, objects and functions)
                                        console.log("Analyzing " + moduleId + "->" + key);
                                        var traversalInfo = getControllersWithClassInstances(previousExportValue);
                                        // console.log(traversalInfo);
                                        traversalInfo.forEach(function (info) {
                                            if (info.propertyInParent === undefined) {
                                                return;
                                            }
                                            if (info.instance) {
                                                var entry = info.immediateParent[info.propertyInParent];
                                                var newPrototype = newExportValue.prototype;
                                                if (newPrototype) {
                                                    Object.setPrototypeOf(entry, newPrototype);
                                                }
                                                else {
                                                    console.warn("No new prototype for " + moduleId + "->" + key);
                                                }
                                                if (info.relatedView && info.relatedView.isBound) {
                                                    var _a = info.relatedView, bindingContext = _a.bindingContext, overrideContext = _a.overrideContext;
                                                    info.relatedView.unbind();
                                                    info.relatedView.bind(bindingContext, overrideContext);
                                                }
                                                // if (info.parentController && info.parentController.isBound) {
                                                //   const scope = info.parentController.scope;
                                                //   info.parentController.unbind();
                                                //   info.parentController.bind(scope);
                                                // }
                                            }
                                            else {
                                                console.log("Replacing", info.immediateParent[info.propertyInParent], "with", newExportValue);
                                                info.immediateParent[info.propertyInParent] = newExportValue;
                                            }
                                        });
                                    }
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Handles Hot Reloading when a View changes
         *
         * TODO: make a queue of changes and handle after few ms multiple TOGETHER
         */
        HmrContext.prototype.handleViewChange = function (moduleId) {
            return __awaiter(this, void 0, void 0, function () {
                var templateModuleId, entry, originalFactory, _a, mainResource, associatedModuleId, htmlBehaviorResource, targetClass, compileInstruction, newViewFactory, elementsToReRender, factoryToRenderWith;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            templateModuleId = this.loader.applyPluginToUrl(moduleId, 'template-registry-entry');
                            console.log("Handling HMR for " + moduleId);
                            entry = this.loader.getOrCreateTemplateRegistryEntry(moduleId);
                            // delete it, and the module from caches:
                            delete this.loader.templateRegistry[moduleId];
                            delete this.loader.moduleRegistry[moduleId];
                            delete this.loader.moduleRegistry[templateModuleId];
                            originalFactory = entry.factory;
                            // just to be safe, lets patch up the old ViewFactory
                            if (!originalFactory) {
                                console.error("Something's gone wrong, no original ViewFactory?!");
                                return [2 /*return*/];
                            }
                            _a = this.getResourceModuleByTemplate(originalFactory.template), mainResource = _a.mainResource, associatedModuleId = _a.id;
                            htmlBehaviorResource = mainResource.metadata, targetClass = mainResource.value;
                            if (entry.factory !== htmlBehaviorResource.viewFactory) {
                                console.info("Different origin factories", entry.factory, htmlBehaviorResource.viewFactory);
                            }
                            compileInstruction = new aurelia_templating_1.ViewCompileInstruction(htmlBehaviorResource.targetShadowDOM, true);
                            compileInstruction.associatedModuleId = associatedModuleId;
                            return [4 /*yield*/, this.viewEngine.loadViewFactory(moduleId, compileInstruction, null, targetClass)];
                        case 1:
                            newViewFactory = (_b.sent());
                            // TODO: keep track of hidden Views, e.g. 
                            // using beforeBind or mutation-observers https://dev.opera.com/articles/mutation-observers-tutorial/
                            // NOTES:
                            // the document-fragment in the newViewFactory has different numbers for the same resources:
                            // newViewFactory.instructions -- have different numbers than originalFactory
                            // newViewFactory.resources.elements -- contains the resources of children but not the SELF HtmlBehaviorResource
                            // monkey-patch the template just in case references to it are lying still around somewhere:
                            originalFactory.template = newViewFactory.template;
                            originalFactory.instructions = newViewFactory.instructions;
                            originalFactory.resources = newViewFactory.resources;
                            elementsToReRender = view_traverse_controller_1.getElementsToRerender(originalFactory.template);
                            factoryToRenderWith = newViewFactory;
                            // const factoryToRenderWith = originalFactory;
                            elementsToReRender.slots.forEach(function (slot) { return render_utils_1.rerenderMatchingSlotChildren(slot, factoryToRenderWith, originalFactory.template); });
                            elementsToReRender.viewControllers.forEach(function (e) { return render_utils_1.rerenderController(e, 'view', factoryToRenderWith); });
                            elementsToReRender.scopeControllers.forEach(function (e) { return render_utils_1.rerenderController(e, 'scope', factoryToRenderWith); });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * handles hot-reloading CSS modules
         */
        HmrContext.prototype.reloadCss = function (moduleId) {
            if (!(moduleId in this.loader.moduleRegistry)) {
                return; // first load
            }
            var extensionIndex = moduleId.lastIndexOf('.');
            var moduleExtension = moduleId.substring(extensionIndex + 1);
            var pluginName = moduleExtension + "-resource-plugin";
            var cssPluginModuleId = this.loader.applyPluginToUrl(moduleId, pluginName);
            console.log("Handling HMR for " + moduleId);
            delete this.loader.moduleRegistry[moduleId];
            delete this.loader.moduleRegistry[cssPluginModuleId];
            var analyzedModule = this.moduleAnalyzerCache[cssPluginModuleId];
            if (typeof analyzedModule === 'undefined') {
                console.error("Unable to find module, check the plugin exists and the module has been loaded with the expected plugin");
                return;
            }
            else if (!analyzedModule.resources || !analyzedModule.resources.length) {
                console.error("Something's wrong, no resources for this CSS file " + moduleId);
                return;
            }
            var mainResource = analyzedModule.resources[0];
            var cssResource = mainResource.metadata;
            if (cssResource._scoped && cssResource._scoped.injectedElements.length) {
                console.error("Hot Reloading scopedCSS is not yet supported!");
                return;
                // cssResource._scoped.injectedElements.forEach(el => el.remove());
            }
            if (cssResource.injectedElement) {
                cssResource.injectedElement.remove();
            }
            // reload resource
            cssResource.load(aurelia_dependency_injection_1.Container.instance);
        };
        HmrContext.prototype.getResourceModuleByTemplate = function (template) {
            // find the related ResourceModule (if any)
            var relatedResourceModule = Object.values(this.moduleAnalyzerCache).find(function (resourceModule) {
                return resourceModule.mainResource &&
                    resourceModule.mainResource.metadata &&
                    resourceModule.mainResource.metadata.viewFactory &&
                    resourceModule.mainResource.metadata.viewFactory.template === template;
            });
            return relatedResourceModule || UndefinedResourceModule;
        };
        HmrContext.prototype.getResourceModuleById = function (moduleId) {
            return moduleId in this.moduleAnalyzerCache ? this.moduleAnalyzerCache[moduleId] : UndefinedResourceModule;
        };
        return HmrContext;
    }());
    exports.HmrContext = HmrContext;
});
