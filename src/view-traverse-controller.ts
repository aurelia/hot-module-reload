import { ViewSlot } from 'aurelia-templating';
import { AU, AUController, ViewCorrect, ViewSlotCorrect } from './_typings';
import { getAuElements } from './aurelia-hot-module-reload'

export function getViewSlots(view: ViewCorrect) {
  if (view.children && view.children.length) {
    return view.children.filter(viewSlot => 
      viewSlot instanceof ViewSlot && viewSlot.children && viewSlot.children.length
    )
  }
  return []
}

export function anyMatchingChildren(viewSlot: ViewSlotCorrect, matchingTemplate: any) {
  return !!viewSlot.children.find(view => view.viewFactory && view.viewFactory.template === matchingTemplate)
}

export function traverseControllerForTemplates(auController: AUController, matchingTemplate: any) {
  let matchingViewControllers = [] as Array<AUController>
  let matchingScopeControllers = [] as Array<AUController>
  
  let view = (auController.view) as ViewCorrect
  let scope = (auController.scope) as ViewCorrect
  let slotsWithMatchingViews = [] as Array<ViewSlotCorrect>

  if (view && view.viewFactory && view.viewFactory.template === matchingTemplate) {
    matchingViewControllers = [auController] // [view.controller] // whole View and all of its children will be rendered
  } else if (scope && scope.controller && scope.viewFactory && scope.viewFactory.template === matchingTemplate) {
    matchingScopeControllers = [scope.controller]
  } else {
    let viewViewSlots = view ? getViewSlots(view) : []
    let scopeViewSlots = scope ? getViewSlots(scope) : []
    slotsWithMatchingViews = Array.from(
      new Set(viewViewSlots.concat(scopeViewSlots))
    ).filter(slot => anyMatchingChildren(slot, matchingTemplate))
  }
  return {
    matchingViewControllers,
    matchingScopeControllers,
    slotsWithMatchingViews
  }
}

export function getElementsToRerender(template: any) {
  // get visible elements to re-render:
  const auElements = getAuElements();

  const controllers = auElements.filter(el => 
    /* NOTE: viewless components like blur-image do not have el.au.controller set */ 
    el.au && el.au.controller && (el.au.controller.view || el.au.controller.scope)
  ).map(el => el.au.controller)

  let viewControllers = new Set<AUController>()
  let scopeControllers = new Set<AUController>()
  let slots = new Set<ViewSlotCorrect>()

  controllers
    .forEach(controller => {
      const {matchingViewControllers, matchingScopeControllers, slotsWithMatchingViews} = traverseControllerForTemplates(controller, template);
      matchingViewControllers.forEach(
        controller => viewControllers.add(controller)
      );
      matchingScopeControllers.forEach(
        controller => scopeControllers.add(controller)
      );
      slotsWithMatchingViews.forEach(
        slot => slots.add(slot)
      );
    });
  
  const toRender = {viewControllers, scopeControllers, slots};
  return toRender;
}
