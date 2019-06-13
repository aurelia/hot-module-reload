define(["require", "exports", "aurelia-templating"], function (require, exports, aurelia_templating_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function recreateView(viewFactory, oldViewContainer) {
        var parentContainer = oldViewContainer.parent || oldViewContainer;
        var targetInstruction = oldViewContainer.get(aurelia_templating_1.TargetInstruction);
        // const targetInstruction = container.get(TargetInstruction) as TargetInstruction;
        var factoryCreateInstruction = targetInstruction.elementInstruction || { partReplacements: null };
        // let factoryCreateInstruction = ({partReplacements: null} as BehaviorInstruction);
        // console.log(`new element instruction`, targetInstruction, factoryCreateInstruction);
        var newContainer = parentContainer.createChild();
        newContainer._resolvers = oldViewContainer._resolvers;
        // const newContainer = oldViewContainer;
        var newView = viewFactory.create(newContainer, factoryCreateInstruction);
        newView._isUserControlled = true;
        return newView;
    }
    exports.recreateView = recreateView;
    function cleanupView(view) {
        var firstChild = view.firstChild;
        var lastChild = view.lastChild;
        var nextSibling = lastChild.nextSibling;
        var parent = firstChild.parentElement;
        var bindingContext = view.bindingContext, overrideContext = view.overrideContext, container = view.container;
        view.removeNodes();
        var wasAttached = view.isAttached;
        if (wasAttached) {
            view.detached();
        }
        var wasBound = view.isBound;
        if (wasBound) {
            view.unbind();
        }
        view._invalidView = true;
        return { nextSibling: nextSibling, parent: parent, wasBound: wasBound, wasAttached: wasAttached, bindingContext: bindingContext, overrideContext: overrideContext, container: container };
    }
    exports.cleanupView = cleanupView;
    function rerenderController(e, type, newViewFactory) {
        var oldView = e[type];
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
        var _a = cleanupView(oldView), nextSibling = _a.nextSibling, parent = _a.parent, wasBound = _a.wasBound, wasAttached = _a.wasAttached, bindingContext = _a.bindingContext, overrideContext = _a.overrideContext, oldViewContainer = _a.container;
        // create & add view:
        var newView = oldView._replacementView = e[type] = recreateView(newViewFactory || oldView.viewFactory, oldViewContainer);
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
    exports.rerenderController = rerenderController;
    function rerenderMatchingSlotChildren(slot, newViewFactory, originalFactoryTemplate, onlyViews) {
        var previousChildren = slot.children.slice();
        var viewsToReplace = previousChildren.filter(function (view) { return (onlyViews && onlyViews.indexOf(view) >= 0) || (view.viewFactory && view.viewFactory.template === originalFactoryTemplate); });
        var bindingContexts = new Map();
        var overrideContexts = new Map();
        var controllers = new Map();
        viewsToReplace.forEach(function (oldView) {
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
        previousChildren.forEach(function (oldView, index) {
            if (!oldView._invalidView) {
                // don't do anything to non-matching Views
                return;
            }
            var bindingContext = bindingContexts.get(oldView);
            var overrideContext = overrideContexts.get(oldView);
            var controller = controllers.get(oldView);
            var view = recreateView(newViewFactory || oldView.viewFactory, oldView.container);
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
    exports.rerenderMatchingSlotChildren = rerenderMatchingSlotChildren;
});
