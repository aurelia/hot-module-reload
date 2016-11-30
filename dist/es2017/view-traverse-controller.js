import { ViewSlot } from 'aurelia-templating';
import { getAuElements } from './aurelia-hot-module-reload';
export function getViewSlots(view) {
    if (view.children && view.children.length) {
        return view.children.filter(viewSlot => viewSlot instanceof ViewSlot && viewSlot.children && viewSlot.children.length);
    }
    return [];
}
export function anyMatchingChildren(viewSlot, matchingTemplate) {
    return !!viewSlot.children.find(view => view.viewFactory && view.viewFactory.template === matchingTemplate);
}
export function traverseControllerForTemplates(auController, matchingTemplate) {
    let matchingViewControllers = [];
    let matchingScopeControllers = [];
    let view = (auController.view);
    let scope = (auController.scope);
    let slotsWithMatchingViews = [];
    if (view && view.viewFactory && view.viewFactory.template === matchingTemplate) {
        matchingViewControllers = [auController]; // [view.controller] // whole View and all of its children will be rendered
    }
    else if (scope && scope.controller && scope.viewFactory && scope.viewFactory.template === matchingTemplate) {
        matchingScopeControllers = [scope.controller];
    }
    else {
        let viewViewSlots = view ? getViewSlots(view) : [];
        let scopeViewSlots = scope ? getViewSlots(scope) : [];
        slotsWithMatchingViews = Array.from(new Set(viewViewSlots.concat(scopeViewSlots))).filter(slot => anyMatchingChildren(slot, matchingTemplate));
    }
    return {
        matchingViewControllers,
        matchingScopeControllers,
        slotsWithMatchingViews
    };
}
export function getElementsToRerender(template) {
    // get visible elements to re-render:
    const auElements = getAuElements();
    const controllers = auElements.filter(el => 
    /* NOTE: viewless components like blur-image do not have el.au.controller set */
    el.au && el.au.controller && (el.au.controller.view || el.au.controller.scope)).map(el => el.au.controller);
    let viewControllers = new Set();
    let scopeControllers = new Set();
    let slots = new Set();
    controllers
        .forEach(controller => {
        const { matchingViewControllers, matchingScopeControllers, slotsWithMatchingViews } = traverseControllerForTemplates(controller, template);
        matchingViewControllers.forEach(controller => viewControllers.add(controller));
        matchingScopeControllers.forEach(controller => scopeControllers.add(controller));
        slotsWithMatchingViews.forEach(slot => slots.add(slot));
    });
    const toRender = { viewControllers, scopeControllers, slots };
    return toRender;
}
