import { ViewResources, ViewCompileInstruction } from 'aurelia-templating';
import { Container } from 'aurelia-dependency-injection';
export declare let cssUrlMatcher: RegExp;
export declare function fixupCSSUrls(address: string, css: string): string;
export declare class CSSResource {
    address: string;
    _scoped: CSSViewEngineHooks | null;
    _global: boolean;
    _alreadyGloballyInjected: boolean;
    injectedElement: HTMLStyleElement | null;
    constructor(address: string);
    initialize(container: Container, target: typeof CSSViewEngineHooks): void;
    register(registry: ViewResources, name?: string): void;
    load(container: Container): Promise<void>;
}
export declare class CSSViewEngineHooks {
    owner: CSSResource;
    css: string | null;
    injectedElements: HTMLStyleElement[];
    constructor(owner: CSSResource);
    beforeCompile(content: DocumentFragment, resources: ViewResources, instruction: ViewCompileInstruction): void;
}
export declare function _createCSSResource(address: string): Function;
