import { Controller, View, ViewSlot, BehaviorInstruction, ViewFactory, HtmlBehaviorResource, ResourceModule } from 'aurelia-templating';
import { Container } from 'aurelia-dependency-injection';
export declare type AUController = Controller & {
    scope: ViewCorrect;
    view: ViewCorrect;
    container: Container;
    instruction?: BehaviorInstruction;
    isBound: boolean;
    isAttached: boolean;
};
export interface AU {
    au: {
        controller: AUController;
    };
}
export declare type ResourceList = {
    [name: string]: any;
};
export declare type ViewResources = {
    bindingBehaviors: ResourceList;
    valueConverters: ResourceList;
    parent?: ViewResources;
};
export declare type ViewFactoryWithTemplate = ViewFactory & {
    template: any;
    resources: any;
    instructions: any;
};
export declare type ViewSlotCorrect = ViewSlot & {
    children: Array<ViewCorrect>;
    bindingContext: any;
    overrideContext: any;
};
export declare type ViewCorrect = View & {
    viewFactory: ViewFactoryWithTemplate;
    children: Array<ViewSlotCorrect>;
    controller: AUController;
    controllers?: Array<AUController>;
    resources?: ViewResources;
    isBound: boolean;
    isAttached: boolean;
    firstChild: Node;
    lastChild: Node;
    _isUserControlled: boolean;
    /**
     * added by HMR, reference to the View that replaced this instance
     */
    _replacementView?: ViewCorrect;
    /**
     * added by HMR as true when View isn't up-to-date with the latest template
     */
    _invalidView?: boolean;
};
export interface ResourceModuleCorrect extends ResourceModule {
    id: string | null;
    mainResource: {
        metadata: any;
        value: any;
    };
    resources: any;
}
export declare type HtmlBehaviorResourceCorrect = HtmlBehaviorResource & {
    target: any;
    viewFactory: ViewFactoryWithTemplate;
    attributes?: Array<any>;
};
