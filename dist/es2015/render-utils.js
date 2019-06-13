import { TargetInstruction } from 'aurelia-templating';
export function recreateView(viewFactory, oldViewContainer) {
    let parentContainer = oldViewContainer.parent || oldViewContainer;
    const targetInstruction = oldViewContainer.get(TargetInstruction);
    // const targetInstruction = container.get(TargetInstruction) as TargetInstruction;
    let factoryCreateInstruction = targetInstruction.elementInstruction || { partReplacements: null };
    // let factoryCreateInstruction = ({partReplacements: null} as BehaviorInstruction);
    // console.log(`new element instruction`, targetInstruction, factoryCreateInstruction);
    const newContainer = parentContainer.createChild();
    newContainer._resolvers = oldViewContainer._resolvers;
    // const newContainer = oldViewContainer;
    const newView = viewFactory.create(newContainer, factoryCreateInstruction);
    newView._isUserControlled = true;
    return newView;
}
export function cleanupView(view) {
    const firstChild = view.firstChild;
    const lastChild = view.lastChild;
    const nextSibling = lastChild.nextSibling;
    const parent = firstChild.parentElement;
    const { bindingContext, overrideContext, container } = view;
    view.removeNodes();
    let wasAttached = view.isAttached;
    if (wasAttached) {
        view.detached();
    }
    let wasBound = view.isBound;
    if (wasBound) {
        view.unbind();
    }
    view._invalidView = true;
    return { nextSibling, parent, wasBound, wasAttached, bindingContext, overrideContext, container };
}
export function rerenderController(e, type, newViewFactory) {
    let oldView = e[type];
    if (!oldView) {
        // view was removed from the controller in a previous run, ignore
        return;
    }
    if (oldView._invalidView) {
        // previously re-rendered, ensure controller is set and skip
        if (oldView._replacementView) {
            e[type] = oldView._replacementView;
        }
        return;
    }
    const { nextSibling, parent, wasBound, wasAttached, bindingContext, overrideContext, container: oldViewContainer } = cleanupView(oldView);
    // create & add view:
    const newView = oldView._replacementView = e[type] = recreateView(newViewFactory || oldView.viewFactory, oldViewContainer);
    if (!newView.isBound && wasBound) {
        newView.bind(bindingContext, overrideContext);
    }
    if (nextSibling) {
        newView.insertNodesBefore(nextSibling);
    }
    else {
        newView.appendNodesTo(parent);
    }
    if (!newView.isAttached && wasAttached) {
        newView.attached();
    }
}
export function rerenderMatchingSlotChildren(slot, newViewFactory, originalFactoryTemplate, onlyViews) {
    const previousChildren = slot.children.slice();
    const viewsToReplace = previousChildren.filter(view => (onlyViews && onlyViews.indexOf(view) >= 0) || (view.viewFactory && view.viewFactory.template === originalFactoryTemplate));
    const bindingContexts = new Map();
    const overrideContexts = new Map();
    const controllers = new Map();
    viewsToReplace.forEach(oldView => {
        // store contexts because they'll be removed when unbound:
        bindingContexts.set(oldView, oldView.bindingContext);
        overrideContexts.set(oldView, oldView.overrideContext);
        controllers.set(oldView, oldView.controller);
        if (oldView.isBound) {
            oldView.unbind();
        }
        oldView._invalidView = true;
    });
    slot.removeMany(viewsToReplace, false, true);
    // recreate removed Views in the same place:
    previousChildren.forEach((oldView, index) => {
        if (!oldView._invalidView) {
            // don't do anything to non-matching Views
            return;
        }
        const bindingContext = bindingContexts.get(oldView);
        const overrideContext = overrideContexts.get(oldView);
        const controller = controllers.get(oldView);
        const view = recreateView(newViewFactory || oldView.viewFactory, oldView.container);
        // setup _replacementView in case the same view is looped over again
        oldView._replacementView = view;
        if (controller) {
            controller.view = view;
        }
        if (!view.isBound) {
            view.bind(bindingContext, overrideContext);
        }
        // indicies should match up and grow as we iterate up
        slot.insert(index, view);
    });
}
