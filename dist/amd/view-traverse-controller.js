define(["require", "exports", "aurelia-templating", "./aurelia-hot-module-reload"], function (require, exports, aurelia_templating_1, aurelia_hot_module_reload_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getViewSlots(view) {
        if (view.children && view.children.length) {
            return view.children.filter(function (viewSlot) {
                return viewSlot instanceof aurelia_templating_1.ViewSlot && viewSlot.children && viewSlot.children.length;
            });
        }
        return [];
    }
    exports.getViewSlots = getViewSlots;
    function anyMatchingChildren(viewSlot, matchingTemplate) {
        return !!viewSlot.children.find(function (view) { return view.viewFactory && view.viewFactory.template === matchingTemplate; });
    }
    exports.anyMatchingChildren = anyMatchingChildren;
    function traverseControllerForTemplates(auController, matchingTemplate) {
        var matchingViewControllers = [];
        var matchingScopeControllers = [];
        var view = (auController.view);
        var scope = (auController.scope);
        var slotsWithMatchingViews = [];
        if (view && view.viewFactory && view.viewFactory.template === matchingTemplate) {
            matchingViewControllers = [auController]; // [view.controller] // whole View and all of its children will be rendered
        }
        else if (scope && scope.controller && scope.viewFactory && scope.viewFactory.template === matchingTemplate) {
            matchingScopeControllers = [scope.controller];
        }
        else {
            var viewViewSlots = view ? getViewSlots(view) : [];
            var scopeViewSlots = scope ? getViewSlots(scope) : [];
            slotsWithMatchingViews = Array.from(new Set(viewViewSlots.concat(scopeViewSlots))).filter(function (slot) { return anyMatchingChildren(slot, matchingTemplate); });
        }
        return {
            matchingViewControllers: matchingViewControllers,
            matchingScopeControllers: matchingScopeControllers,
            slotsWithMatchingViews: slotsWithMatchingViews
        };
    }
    exports.traverseControllerForTemplates = traverseControllerForTemplates;
    function getElementsToRerender(template) {
        // get visible elements to re-render:
        var auElements = aurelia_hot_module_reload_1.getAuElements();
        var controllers = auElements.filter(function (el) {
            /* NOTE: viewless components like blur-image do not have el.au.controller set */
            return el.au && el.au.controller && (el.au.controller.view || el.au.controller.scope);
        }).map(function (el) { return el.au.controller; });
        var viewControllers = new Set();
        var scopeControllers = new Set();
        var slots = new Set();
        controllers
            .forEach(function (controller) {
            var _a = traverseControllerForTemplates(controller, template), matchingViewControllers = _a.matchingViewControllers, matchingScopeControllers = _a.matchingScopeControllers, slotsWithMatchingViews = _a.slotsWithMatchingViews;
            matchingViewControllers.forEach(function (controller) { return viewControllers.add(controller); });
            matchingScopeControllers.forEach(function (controller) { return scopeControllers.add(controller); });
            slotsWithMatchingViews.forEach(function (slot) { return slots.add(slot); });
        });
        var toRender = { viewControllers: viewControllers, scopeControllers: scopeControllers, slots: slots };
        return toRender;
    }
    exports.getElementsToRerender = getElementsToRerender;
});
