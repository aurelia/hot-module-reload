import { BehaviorInstruction } from 'aurelia-templating';
import { AUController, ViewSlotCorrect, ViewCorrect, ViewFactoryWithTemplate, ViewResources, HtmlBehaviorResourceCorrect } from './_typings';
export interface TraversalInfo {
    parentController: AUController;
    previouslyTraversed: Set<any>;
    immediateParent?: any;
    propertyInParent?: string | number;
    childOfViewSlot?: ViewSlotCorrect;
    relatedView?: ViewCorrect;
    instance?: boolean;
    duplicate?: boolean;
}
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
export declare function traverseController(classOrFunction: any, controller: AUController, info: TraversalInfo): TraversalInfo[];
export declare function traverseBehaviorResource(classOrFunction: any, behavior: HtmlBehaviorResourceCorrect, info: TraversalInfo): TraversalInfo[];
export declare function traverseViewFactory(classOrFunction: any, viewFactory: ViewFactoryWithTemplate, info: TraversalInfo): TraversalInfo[];
export declare function traverseViewResources(classOrFunction: any, viewResources: ViewResources | undefined, info: TraversalInfo): TraversalInfo[];
export declare function traverseBehaviorInstruction(classOrFunction: any, behaviorInstruction: BehaviorInstruction | undefined, info: TraversalInfo): TraversalInfo[];
export declare function traverseViewModel(classOrFunction: any, viewModel: any, info: TraversalInfo): TraversalInfo[];
export declare function traverseRouter(classOrFunction: any, router: any, info: TraversalInfo): TraversalInfo[];
export declare function traverseRouterView(classOrFunction: any, routerView: any, info: TraversalInfo): TraversalInfo[];
export declare function traverseView(classOrFunction: any, view: ViewCorrect, info: TraversalInfo): TraversalInfo[];
export declare function traverseOverrideContext(classOrFunction: any, overrideContext: any, info: TraversalInfo): TraversalInfo[];
export declare function traverseViewSlot(classOrFunction: any, viewSlot: ViewSlotCorrect, info: TraversalInfo): TraversalInfo[];
