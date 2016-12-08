var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     *  traverse interesting places in Controller:
     * - behavior.target (class of ViewModel)
     * - behavior.viewFactory (traverse ViewFactory)
     * - behavior.attributes[array] (?)
     *
     * - viewFactory.instructions[ALL-obj].providers[ALL-arr] (original functions/classes, not instances, things like If)
     * - viewFactory.instructions[ALL-obj].viewFactory
     *
     * - viewFactory.resources (ViewResources)
     *      .bindingBehaviors[name] (instances, can fix up .constructor is class)
     *      .valueConverters[name] (instances, can fix up .constructor is class)
     *
     * - boundProperties[array] ??
     * - container //how can we replace instances in container?
     * - container.children[array<ViewSlot>]?
     * - container
     *      .viewModel? (instance)
     *      .viewResources (ViewResources)
     *
     * - instruction (BehaviorInstruction)
     *      .viewFactory
     *      .viewModel (instance)
     *
     * - scope (View)
     *      .bindingContext (instance)
     *      .children[array<ViewSlot>]
     *      .controller (Controller)
     *      .controllers[array<Controller>]
     *      .overrideContext
     *         .bindingContext? (Instance)
     *         .parentOverrideContext
     *               .bindingContext? (and so on...)
     *      .resources (ViewResources)
     *      .viewFactory (ViewFactory)
     * - view (View)
     * - viewModel (instance or RouterView:)
     *      .overrideContext
     *      .router.viewPorts[ALL-obj]. (RouterView)
     *               .overrideContext
     *               .owningView (View)
     *               .view (View)
     *               .viewSlot (ViewSlot)
     *                     .children[array<View>]
     *                     .bindingContext (instance)
     *                     .overrideContext
     **/
    function traverseController(classOrFunction, controller, info) {
        var matches = [];
        if (!controller || info.previouslyTraversed.has(controller))
            return matches;
        info.previouslyTraversed.add(controller);
        matches.push.apply(matches, traverseBehaviorResource(classOrFunction, controller.behavior, __assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'behavior' })).concat(traverseBehaviorInstruction(classOrFunction, controller.instruction, __assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'instruction' })), traverseView(classOrFunction, controller.scope, __assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'scope' })), traverseView(classOrFunction, controller.view, __assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'view' })), traverseViewModel(classOrFunction, controller.viewModel, __assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'viewModel' }))));
        return matches;
    }
    exports.traverseController = traverseController;
    function traverseBehaviorResource(classOrFunction, behavior, info) {
        var matches = [];
        if (!behavior || info.previouslyTraversed.has(behavior))
            return matches;
        info.previouslyTraversed.add(behavior);
        if (behavior.target === classOrFunction) {
            matches.push(__assign({}, info, { immediateParent: behavior, propertyInParent: 'target' }));
        }
        matches.push.apply(matches, traverseViewFactory(classOrFunction, behavior.viewFactory, __assign({}, info, { immediateParent: behavior, propertyInParent: 'viewFactory' })));
        return matches;
    }
    exports.traverseBehaviorResource = traverseBehaviorResource;
    function traverseViewFactory(classOrFunction, viewFactory, info) {
        var matches = [];
        if (!viewFactory || info.previouslyTraversed.has(viewFactory))
            return matches;
        info.previouslyTraversed.add(viewFactory);
        if (viewFactory.instructions) {
            Object.keys(viewFactory.instructions).forEach(function (instructionKey) {
                var instruction = viewFactory.instructions[instructionKey];
                matches.push.apply(matches, traverseViewFactory(classOrFunction, instruction.viewFactory, __assign({}, info, { immediateParent: instruction, propertyInParent: 'viewFactory' })));
                if (instruction.providers && instruction.providers.length) {
                    instruction.providers.forEach(function (providerKey, index) {
                        if (providerKey === classOrFunction) {
                            matches.push(__assign({}, info, { immediateParent: instruction.providers, propertyInParent: index }));
                        }
                    });
                }
            });
        }
        if (viewFactory.resources) {
            matches.push.apply(matches, traverseViewResources(classOrFunction, viewFactory.resources, __assign({}, info, { immediateParent: viewFactory, propertyInParent: 'resources' })));
        }
        return matches;
    }
    exports.traverseViewFactory = traverseViewFactory;
    function traverseViewResources(classOrFunction, viewResources, info) {
        var matches = [];
        if (!viewResources || info.previouslyTraversed.has(viewResources))
            return matches;
        info.previouslyTraversed.add(viewResources);
        ['bindingBehaviors', 'valueConverters'].forEach(function (type) {
            var viewResourceInstances = viewResources[type];
            if (viewResourceInstances) {
                Object.keys(viewResourceInstances).forEach(function (key) {
                    var instance = viewResourceInstances[key];
                    if (instance && instance.constructor === classOrFunction) {
                        matches.push(__assign({}, info, { immediateParent: viewResourceInstances, propertyInParent: key, instance: true }));
                    }
                });
            }
        });
        matches.push.apply(matches, traverseViewResources(classOrFunction, viewResources.parent, __assign({}, info, { immediateParent: viewResources, propertyInParent: 'parent' })));
        return matches;
    }
    exports.traverseViewResources = traverseViewResources;
    function traverseBehaviorInstruction(classOrFunction, behaviorInstruction, info) {
        var matches = [];
        if (!behaviorInstruction || info.previouslyTraversed.has(behaviorInstruction))
            return matches;
        info.previouslyTraversed.add(behaviorInstruction);
        matches.push.apply(matches, traverseViewFactory(classOrFunction, behaviorInstruction.viewFactory, __assign({}, info, { immediateParent: behaviorInstruction, propertyInParent: 'viewFactory' })).concat(traverseViewModel(classOrFunction, behaviorInstruction.viewModel, __assign({}, info, { immediateParent: behaviorInstruction, propertyInParent: 'viewModel' }))));
        return matches;
    }
    exports.traverseBehaviorInstruction = traverseBehaviorInstruction;
    function traverseViewModel(classOrFunction, viewModel, info) {
        var matches = [];
        if (!viewModel)
            return matches;
        var duplicate = info.previouslyTraversed.has(viewModel);
        info.previouslyTraversed.add(viewModel);
        if (viewModel.constructor === classOrFunction) {
            matches.push(__assign({}, info, { instance: true, duplicate: duplicate }));
            if (duplicate) {
                return matches;
            }
        }
        matches.push.apply(matches, traverseOverrideContext(classOrFunction, viewModel.overrideContext, __assign({}, info, { immediateParent: viewModel, propertyInParent: 'overrideContext' })).concat(traverseRouter(classOrFunction, viewModel.router, __assign({}, info, { immediateParent: viewModel, propertyInParent: 'router' }))));
        return matches;
    }
    exports.traverseViewModel = traverseViewModel;
    function traverseRouter(classOrFunction, router, info) {
        var matches = [];
        if (!router || info.previouslyTraversed.has(router))
            return matches;
        info.previouslyTraversed.add(router);
        if (router.viewPorts) {
            Object.keys(router.viewPorts).forEach(function (key) {
                var viewPort = router.viewPorts[key]; // as RouterView;
                matches.push.apply(// as RouterView;
                matches, traverseRouterView(classOrFunction, viewPort, __assign({}, info, { immediateParent: router.viewPorts, propertyInParent: key })));
            });
        }
        return matches;
    }
    exports.traverseRouter = traverseRouter;
    function traverseRouterView(classOrFunction, routerView, info) {
        var matches = [];
        if (!routerView || info.previouslyTraversed.has(routerView))
            return matches;
        info.previouslyTraversed.add(routerView);
        matches.push.apply(matches, traverseOverrideContext(classOrFunction, routerView.overrideContext, __assign({}, info, { immediateParent: routerView, propertyInParent: 'overrideContext' })).concat(traverseView(classOrFunction, routerView.owningView, __assign({}, info, { immediateParent: routerView, propertyInParent: 'owningView' })), traverseView(classOrFunction, routerView.view, __assign({}, info, { immediateParent: routerView, propertyInParent: 'view' })), traverseViewSlot(classOrFunction, routerView.viewSlot, __assign({}, info, { immediateParent: routerView, propertyInParent: 'viewSlot' }))));
        return matches;
    }
    exports.traverseRouterView = traverseRouterView;
    function traverseView(classOrFunction, view, info) {
        var matches = [];
        if (!view || info.previouslyTraversed.has(view))
            return matches;
        info.previouslyTraversed.add(view);
        matches.push.apply(matches, traverseViewModel(classOrFunction, view.bindingContext, __assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'bindingContext' })).concat(traverseController(classOrFunction, view.controller, __assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'controller' })), traverseOverrideContext(classOrFunction, view.overrideContext, __assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'overrideContext' })), traverseViewResources(classOrFunction, view.resources, __assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'resources' })), traverseViewFactory(classOrFunction, view.viewFactory, __assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'viewFactory' }))));
        if (view.controllers && view.controllers.length) {
            view.controllers.forEach(function (controller, index) {
                matches.push.apply(matches, traverseController(classOrFunction, controller, __assign({}, info, { relatedView: view, immediateParent: view.controllers, propertyInParent: index })));
            });
        }
        if (view.children && view.children.length) {
            view.children.forEach(function (viewSlot, index) {
                matches.push.apply(matches, traverseViewSlot(classOrFunction, viewSlot, __assign({}, info, { childOfViewSlot: viewSlot, relatedView: view, immediateParent: view.children, propertyInParent: index })));
            });
        }
        return matches;
    }
    exports.traverseView = traverseView;
    function traverseOverrideContext(classOrFunction, overrideContext, info) {
        var matches = [];
        if (!overrideContext || info.previouslyTraversed.has(overrideContext))
            return matches;
        info.previouslyTraversed.add(overrideContext);
        matches.push.apply(matches, traverseViewModel(classOrFunction, overrideContext.bindingContext, __assign({}, info, { immediateParent: overrideContext, propertyInParent: 'bindingContext' })).concat(traverseOverrideContext(classOrFunction, overrideContext.parentOverrideContext, __assign({}, info, { immediateParent: overrideContext, propertyInParent: 'parentOverrideContext' }))));
        return matches;
    }
    exports.traverseOverrideContext = traverseOverrideContext;
    function traverseViewSlot(classOrFunction, viewSlot, info) {
        var matches = [];
        if (!viewSlot || info.previouslyTraversed.has(viewSlot))
            return matches;
        info.previouslyTraversed.add(viewSlot);
        matches.push.apply(matches, traverseViewModel(classOrFunction, viewSlot.bindingContext, __assign({}, info, { immediateParent: viewSlot, propertyInParent: 'bindingContext' })).concat(traverseOverrideContext(classOrFunction, viewSlot.overrideContext, __assign({}, info, { immediateParent: viewSlot, propertyInParent: 'overrideContext' }))));
        if (viewSlot.children && viewSlot.children.length) {
            viewSlot.children.forEach(function (child, index) {
                matches.push.apply(matches, traverseView(classOrFunction, child, __assign({}, info, { childOfViewSlot: viewSlot, relatedView: child, immediateParent: viewSlot.children, propertyInParent: index })));
            });
        }
        return matches;
    }
    exports.traverseViewSlot = traverseViewSlot;
});
