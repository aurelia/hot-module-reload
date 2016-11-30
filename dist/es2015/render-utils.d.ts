import { AUController, ViewFactoryWithTemplate, ViewCorrect, ViewSlotCorrect } from './_typings';
import { Container } from 'aurelia-dependency-injection';
export declare function recreateView(viewFactory: ViewFactoryWithTemplate, oldViewContainer: Container): ViewCorrect;
export declare function cleanupView(view: ViewCorrect): {
    nextSibling: Node | null;
    parent: HTMLElement | null;
    wasBound: boolean;
    wasAttached: boolean;
    bindingContext: Object;
    overrideContext: Object;
    container: Container;
};
export declare function rerenderController(e: AUController, type: 'scope' | 'view', newViewFactory: ViewFactoryWithTemplate): void;
export declare function rerenderMatchingSlotChildren(slot: ViewSlotCorrect, newViewFactory?: ViewFactoryWithTemplate, originalFactoryTemplate?: any, onlyViews?: Array<ViewCorrect>): void;
