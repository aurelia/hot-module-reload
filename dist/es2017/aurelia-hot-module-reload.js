import { DOM } from 'aurelia-pal';
import { Origin } from 'aurelia-metadata';
import { ViewEngine, ViewCompileInstruction } from 'aurelia-templating';
import { Container } from 'aurelia-dependency-injection';
import { _createCSSResource } from './hmr-css-resource';
import { traverseController } from './view-model-traverse-controller';
import { getElementsToRerender } from './view-traverse-controller';
import { rerenderMatchingSlotChildren, rerenderController } from './render-utils';
const UndefinedResourceModule = { id: null, mainResource: { metadata: {}, value: undefined } };
export function getAuElements() {
    return Array.from(DOM.querySelectorAll('.au-target'));
}
export function getControllersWithClassInstances(oldPrototype) {
    // get visible elements to re-render:
    const auElements = getAuElements();
    /* NOTE: viewless components like blur-image do not have el.au.controller set */
    const controllersLists = auElements.map(el => el.au && Object.values(el.au) || []);
    // list of unique controllers
    const controllers = Array.from(new Set([].concat(...controllersLists)));
    const previouslyTraversed = new Set();
    const traversalInfo = [].concat(...controllers.map(parentController => traverseController(oldPrototype, parentController, {
        previouslyTraversed,
        parentController
    })));
    return traversalInfo;
}
export class HmrContext {
    constructor(loader) {
        this.loader = loader;
        this.viewEngine = Container.instance.get(ViewEngine);
        this.moduleAnalyzerCache = this.viewEngine.moduleAnalyzer.cache;
        const styleResourcePlugin = {
            fetch: (moduleId) => {
                return {
                    [moduleId]: _createCSSResource(moduleId)
                };
            },
            hot: (moduleId) => {
                this.reloadCss(moduleId);
            }
        };
        ['.css', '.less', '.sass', '.scss', '.styl'].forEach(ext => this.viewEngine.addResourcePlugin(ext, styleResourcePlugin));
    }
    /**
     * Handles ViewModel changes
     */
    async handleModuleChange(moduleId, hot) {
        // get old version of the module:
        const previousModule = this.loader.moduleRegistry[moduleId];
        if (!previousModule) {
            return;
        }
        console.log(`Running default HMR for ${moduleId}`);
        // reload fresh module:
        delete this.loader.moduleRegistry[moduleId];
        const newModule = await this.loader.loadModule(moduleId);
        const oldResourceModule = this.moduleAnalyzerCache[moduleId];
        let newResourceModule;
        if (oldResourceModule) {
            // almost the same as: ViewEngine.importViewModelResource(moduleId, moduleMember);
            const origin = Origin.get(newModule);
            const normalizedId = origin.moduleId;
            const moduleMember = origin.moduleMember;
            newResourceModule = this.viewEngine.moduleAnalyzer.analyze(normalizedId, newModule, moduleMember);
            if (!newResourceModule.mainResource && !newResourceModule.resources) {
                hot.decline(moduleId);
                return;
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
            // console.log(`Analysing ${moduleId} as a whole`);
            // getControllersWithClassInstances(previousModule, undefined);
            const keys = Object.keys(previousModule);
            keys.forEach(key => {
                const newExportValue = newModule[key];
                if (!newExportValue) {
                    return;
                }
                const previousExportValue = previousModule[key];
                const type = typeof previousExportValue;
                if (type === 'function' || type === 'object') {
                    // these are the only exports we can reliably replace (classes, objects and functions)
                    console.log(`Analyzing ${moduleId}->${key}`);
                    const traversalInfo = getControllersWithClassInstances(previousExportValue);
                    // console.log(traversalInfo);
                    traversalInfo.forEach(info => {
                        if (info.propertyInParent === undefined) {
                            return;
                        }
                        if (info.instance) {
                            const entry = info.immediateParent[info.propertyInParent];
                            const newPrototype = newExportValue.prototype;
                            if (newPrototype) {
                                Object.setPrototypeOf(entry, newPrototype);
                            }
                            else {
                                console.warn(`No new prototype for ${moduleId}->${key}`);
                            }
                            if (info.relatedView && info.relatedView.isBound) {
                                const { bindingContext, overrideContext } = info.relatedView;
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
                            console.log(`Replacing`, info.immediateParent[info.propertyInParent], `with`, newExportValue);
                            info.immediateParent[info.propertyInParent] = newExportValue;
                        }
                    });
                }
            });
        }
        // find all instances of the Classes
    }
    /**
     * Handles Hot Reloading when a View changes
     *
     * TODO: make a queue of changes and handle after few ms multiple TOGETHER
     */
    async handleViewChange(moduleId) {
        const templateModuleId = this.loader.applyPluginToUrl(moduleId, 'template-registry-entry');
        console.log(`Handling HMR for ${moduleId}`);
        // get old entry:
        let entry = this.loader.getOrCreateTemplateRegistryEntry(moduleId);
        // delete it, and the module from caches:
        delete this.loader.templateRegistry[moduleId];
        delete this.loader.moduleRegistry[moduleId];
        delete this.loader.moduleRegistry[templateModuleId];
        // reload template (also done in loadViewFactory):
        // await this.loader.templatethis.loader.loadTemplate(loader, entry);
        const originalFactory = entry.factory; // htmlBehaviorResource.viewFactory
        // just to be safe, lets patch up the old ViewFactory
        if (!originalFactory) {
            console.error(`Something's gone wrong, no original ViewFactory?!`);
            return;
        }
        const { mainResource, id: associatedModuleId } = this.getResourceModuleByTemplate(originalFactory.template);
        const { metadata: htmlBehaviorResource, value: targetClass } = mainResource;
        if (entry.factory !== htmlBehaviorResource.viewFactory) {
            console.info(`Different origin factories`, entry.factory, htmlBehaviorResource.viewFactory);
        }
        // TODO: find a way to find CSS removed from templates and unload it
        const compileInstruction = new ViewCompileInstruction(htmlBehaviorResource.targetShadowDOM, true);
        compileInstruction.associatedModuleId = associatedModuleId;
        const newViewFactory = (await this.viewEngine.loadViewFactory(moduleId, compileInstruction, null, targetClass));
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
        // TODO: it might be best to replace the instance of the ViewFactory in the HtmlBehaviorResource:
        // but THIS CAUSES LOOPING WITH NESTED ELEMENTS:
        // if (htmlBehaviorResource.viewFactory) {
        //   htmlBehaviorResource.viewFactory = newViewFactory;
        // }
        const elementsToReRender = getElementsToRerender(originalFactory.template);
        const factoryToRenderWith = newViewFactory;
        // const factoryToRenderWith = originalFactory;
        elementsToReRender.slots.forEach(slot => rerenderMatchingSlotChildren(slot, factoryToRenderWith, originalFactory.template));
        elementsToReRender.viewControllers.forEach(e => rerenderController(e, 'view', factoryToRenderWith));
        elementsToReRender.scopeControllers.forEach(e => rerenderController(e, 'scope', factoryToRenderWith));
    }
    /**
     * handles hot-reloading CSS modules
     */
    reloadCss(moduleId) {
        if (!(moduleId in this.loader.moduleRegistry)) {
            return; // first load
        }
        const extensionIndex = moduleId.lastIndexOf('.');
        const moduleExtension = moduleId.substring(extensionIndex + 1);
        const pluginName = `${moduleExtension}-resource-plugin`;
        const cssPluginModuleId = this.loader.applyPluginToUrl(moduleId, pluginName);
        console.log(`Handling HMR for ${moduleId}`);
        delete this.loader.moduleRegistry[moduleId];
        delete this.loader.moduleRegistry[cssPluginModuleId];
        const analyzedModule = this.moduleAnalyzerCache[cssPluginModuleId];
        if (typeof analyzedModule === 'undefined') {
            console.error(`Unable to find module, check the plugin exists and the module has been loaded with the expected plugin`);
            return;
        }
        else if (!analyzedModule.resources || !analyzedModule.resources.length) {
            console.error(`Something's wrong, no resources for this CSS file ${moduleId}`);
            return;
        }
        const mainResource = analyzedModule.resources[0];
        const cssResource = mainResource.metadata;
        if (cssResource._scoped && cssResource._scoped.injectedElements.length) {
            console.error(`Hot Reloading scopedCSS is not yet supported!`);
            return;
            // cssResource._scoped.injectedElements.forEach(el => el.remove());
        }
        if (cssResource.injectedElement) {
            cssResource.injectedElement.remove();
        }
        // reload resource
        cssResource.load(Container.instance);
    }
    getResourceModuleByTemplate(template) {
        // find the related ResourceModule (if any)
        const relatedResourceModule = Object.values(this.moduleAnalyzerCache).find(resourceModule => resourceModule.mainResource &&
            resourceModule.mainResource.metadata &&
            resourceModule.mainResource.metadata.viewFactory &&
            resourceModule.mainResource.metadata.viewFactory.template === template);
        return relatedResourceModule || UndefinedResourceModule;
    }
    getResourceModuleById(moduleId) {
        return moduleId in this.moduleAnalyzerCache ? this.moduleAnalyzerCache[moduleId] : UndefinedResourceModule;
    }
}
