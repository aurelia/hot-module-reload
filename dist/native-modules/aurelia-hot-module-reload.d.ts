import { Loader } from 'aurelia-loader';
import { ViewEngine } from 'aurelia-templating';
import { Container } from 'aurelia-dependency-injection';
import { ResourceModuleCorrect, AU } from './_typings';
import { TraversalInfo } from './view-model-traverse-controller';
export declare function getAuElements(): (Element & AU)[];
export declare function getControllersWithClassInstances(oldPrototype: any): TraversalInfo[];
export declare class HmrContext {
    loader: Loader & {
        moduleRegistry: Object;
        templateRegistry: Object;
    };
    viewEngine: ViewEngine & {
        moduleAnalyzer: any;
        container: Container;
    };
    moduleAnalyzerCache: {
        [moduleId: string]: ResourceModuleCorrect;
    };
    constructor(loader: Loader & {
        moduleRegistry: Object;
        templateRegistry: Object;
    });
    /**
     * Handles ViewModel changes
     */
    handleModuleChange(moduleId: string, hot: any): Promise<void>;
    /**
     * Handles Hot Reloading when a View changes
     *
     * TODO: make a queue of changes and handle after few ms multiple TOGETHER
     */
    handleViewChange(moduleId: string): Promise<void>;
    /**
     * handles hot-reloading CSS modules
     */
    reloadCss(moduleId: string): void;
    getResourceModuleByTemplate(template: any): ResourceModuleCorrect;
    getResourceModuleById(moduleId: string): ResourceModuleCorrect;
}
