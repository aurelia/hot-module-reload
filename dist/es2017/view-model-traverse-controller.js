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
export function traverseController(classOrFunction, controller, info) {
    const matches = [];
    if (!controller || info.previouslyTraversed.has(controller))
        return matches;
    info.previouslyTraversed.add(controller);
    matches.push(...traverseBehaviorResource(classOrFunction, controller.behavior, Object.assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'behavior' })), ...traverseBehaviorInstruction(classOrFunction, controller.instruction, Object.assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'instruction' })), ...traverseView(classOrFunction, controller.scope, Object.assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'scope' })), ...traverseView(classOrFunction, controller.view, Object.assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'view' })), ...traverseViewModel(classOrFunction, controller.viewModel, Object.assign({}, info, { parentController: controller, immediateParent: controller, propertyInParent: 'viewModel' })));
    return matches;
}
export function traverseBehaviorResource(classOrFunction, behavior, info) {
    const matches = [];
    if (!behavior || info.previouslyTraversed.has(behavior))
        return matches;
    info.previouslyTraversed.add(behavior);
    if (behavior.target === classOrFunction) {
        matches.push(Object.assign({}, info, { immediateParent: behavior, propertyInParent: 'target' }));
    }
    matches.push(...traverseViewFactory(classOrFunction, behavior.viewFactory, Object.assign({}, info, { immediateParent: behavior, propertyInParent: 'viewFactory' })));
    return matches;
}
export function traverseViewFactory(classOrFunction, viewFactory, info) {
    const matches = [];
    if (!viewFactory || info.previouslyTraversed.has(viewFactory))
        return matches;
    info.previouslyTraversed.add(viewFactory);
    if (viewFactory.instructions) {
        Object.keys(viewFactory.instructions).forEach(instructionKey => {
            const instruction = viewFactory.instructions[instructionKey];
            matches.push(...traverseViewFactory(classOrFunction, instruction.viewFactory, Object.assign({}, info, { immediateParent: instruction, propertyInParent: 'viewFactory' })));
            if (instruction.providers && instruction.providers.length) {
                instruction.providers.forEach((providerKey, index) => {
                    if (providerKey === classOrFunction) {
                        matches.push(Object.assign({}, info, { immediateParent: instruction.providers, propertyInParent: index }));
                    }
                });
            }
        });
    }
    if (viewFactory.resources) {
        matches.push(...traverseViewResources(classOrFunction, viewFactory.resources, Object.assign({}, info, { immediateParent: viewFactory, propertyInParent: 'resources' })));
    }
    return matches;
}
export function traverseViewResources(classOrFunction, viewResources, info) {
    const matches = [];
    if (!viewResources || info.previouslyTraversed.has(viewResources))
        return matches;
    info.previouslyTraversed.add(viewResources);
    ['bindingBehaviors', 'valueConverters'].forEach(type => {
        const viewResourceInstances = viewResources[type];
        if (viewResourceInstances) {
            Object.keys(viewResourceInstances).forEach(key => {
                const instance = viewResourceInstances[key];
                if (instance && instance.constructor === classOrFunction) {
                    matches.push(Object.assign({}, info, { immediateParent: viewResourceInstances, propertyInParent: key, instance: true }));
                }
            });
        }
    });
    matches.push(...traverseViewResources(classOrFunction, viewResources.parent, Object.assign({}, info, { immediateParent: viewResources, propertyInParent: 'parent' })));
    return matches;
}
export function traverseBehaviorInstruction(classOrFunction, behaviorInstruction, info) {
    const matches = [];
    if (!behaviorInstruction || info.previouslyTraversed.has(behaviorInstruction))
        return matches;
    info.previouslyTraversed.add(behaviorInstruction);
    matches.push(...traverseViewFactory(classOrFunction, behaviorInstruction.viewFactory, Object.assign({}, info, { immediateParent: behaviorInstruction, propertyInParent: 'viewFactory' })), ...traverseViewModel(classOrFunction, behaviorInstruction.viewModel, Object.assign({}, info, { immediateParent: behaviorInstruction, propertyInParent: 'viewModel' })));
    return matches;
}
export function traverseViewModel(classOrFunction, viewModel, info) {
    const matches = [];
    if (!viewModel)
        return matches;
    const duplicate = info.previouslyTraversed.has(viewModel);
    info.previouslyTraversed.add(viewModel);
    if (viewModel.constructor === classOrFunction) {
        matches.push(Object.assign({}, info, { instance: true, duplicate }));
        if (duplicate) {
            return matches;
        }
    }
    matches.push(...traverseOverrideContext(classOrFunction, viewModel.overrideContext, Object.assign({}, info, { immediateParent: viewModel, propertyInParent: 'overrideContext' })), ...traverseRouter(classOrFunction, viewModel.router, Object.assign({}, info, { immediateParent: viewModel, propertyInParent: 'router' })));
    return matches;
}
export function traverseRouter(classOrFunction, router, info) {
    const matches = [];
    if (!router || info.previouslyTraversed.has(router))
        return matches;
    info.previouslyTraversed.add(router);
    if (router.viewPorts) {
        Object.keys(router.viewPorts).forEach(key => {
            const viewPort = router.viewPorts[key]; // as RouterView;
            matches.push(...traverseRouterView(classOrFunction, viewPort, Object.assign({}, info, { immediateParent: router.viewPorts, propertyInParent: key })));
        });
    }
    return matches;
}
export function traverseRouterView(classOrFunction, routerView, info) {
    const matches = [];
    if (!routerView || info.previouslyTraversed.has(routerView))
        return matches;
    info.previouslyTraversed.add(routerView);
    matches.push(...traverseOverrideContext(classOrFunction, routerView.overrideContext, Object.assign({}, info, { immediateParent: routerView, propertyInParent: 'overrideContext' })), ...traverseView(classOrFunction, routerView.owningView, Object.assign({}, info, { immediateParent: routerView, propertyInParent: 'owningView' })), ...traverseView(classOrFunction, routerView.view, Object.assign({}, info, { immediateParent: routerView, propertyInParent: 'view' })), ...traverseViewSlot(classOrFunction, routerView.viewSlot, Object.assign({}, info, { immediateParent: routerView, propertyInParent: 'viewSlot' })));
    return matches;
}
export function traverseView(classOrFunction, view, info) {
    const matches = [];
    if (!view || info.previouslyTraversed.has(view))
        return matches;
    info.previouslyTraversed.add(view);
    matches.push(...traverseViewModel(classOrFunction, view.bindingContext, Object.assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'bindingContext' })), ...traverseController(classOrFunction, view.controller, Object.assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'controller' })), ...traverseOverrideContext(classOrFunction, view.overrideContext, Object.assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'overrideContext' })), ...traverseViewResources(classOrFunction, view.resources, Object.assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'resources' })), ...traverseViewFactory(classOrFunction, view.viewFactory, Object.assign({}, info, { relatedView: view, immediateParent: view, propertyInParent: 'viewFactory' })));
    if (view.controllers && view.controllers.length) {
        view.controllers.forEach((controller, index) => {
            matches.push(...traverseController(classOrFunction, controller, Object.assign({}, info, { relatedView: view, immediateParent: view.controllers, propertyInParent: index })));
        });
    }
    if (view.children && view.children.length) {
        view.children.forEach((viewSlot, index) => {
            matches.push(...traverseViewSlot(classOrFunction, viewSlot, Object.assign({}, info, { childOfViewSlot: viewSlot, relatedView: view, immediateParent: view.children, propertyInParent: index })));
        });
    }
    return matches;
}
export function traverseOverrideContext(classOrFunction, overrideContext, info) {
    const matches = [];
    if (!overrideContext || info.previouslyTraversed.has(overrideContext))
        return matches;
    info.previouslyTraversed.add(overrideContext);
    matches.push(...traverseViewModel(classOrFunction, overrideContext.bindingContext, Object.assign({}, info, { immediateParent: overrideContext, propertyInParent: 'bindingContext' })), ...traverseOverrideContext(classOrFunction, overrideContext.parentOverrideContext, Object.assign({}, info, { immediateParent: overrideContext, propertyInParent: 'parentOverrideContext' })));
    return matches;
}
export function traverseViewSlot(classOrFunction, viewSlot, info) {
    const matches = [];
    if (!viewSlot || info.previouslyTraversed.has(viewSlot))
        return matches;
    info.previouslyTraversed.add(viewSlot);
    matches.push(...traverseViewModel(classOrFunction, viewSlot.bindingContext, Object.assign({}, info, { immediateParent: viewSlot, propertyInParent: 'bindingContext' })), ...traverseOverrideContext(classOrFunction, viewSlot.overrideContext, Object.assign({}, info, { immediateParent: viewSlot, propertyInParent: 'overrideContext' })));
    if (viewSlot.children && viewSlot.children.length) {
        viewSlot.children.forEach((child, index) => {
            matches.push(...traverseView(classOrFunction, child, Object.assign({}, info, { childOfViewSlot: viewSlot, relatedView: child, immediateParent: viewSlot.children, propertyInParent: index })));
        });
    }
    return matches;
}
