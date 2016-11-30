import { AUController, ViewCorrect, ViewSlotCorrect } from './_typings';
export declare function getViewSlots(view: ViewCorrect): ViewSlotCorrect[];
export declare function anyMatchingChildren(viewSlot: ViewSlotCorrect, matchingTemplate: any): boolean;
export declare function traverseControllerForTemplates(auController: AUController, matchingTemplate: any): {
    matchingViewControllers: AUController[];
    matchingScopeControllers: AUController[];
    slotsWithMatchingViews: ViewSlotCorrect[];
};
export declare function getElementsToRerender(template: any): {
    viewControllers: Set<AUController>;
    scopeControllers: Set<AUController>;
    slots: Set<ViewSlotCorrect>;
};
