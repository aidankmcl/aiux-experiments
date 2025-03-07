import { LitElement } from 'lit';
interface TargetMapping {
    [command: string]: string[];
}
export declare class CommandCategorizer extends LitElement {
    static styles: import("lit").CSSResult;
    modelName: string;
    debug: boolean;
    targetMappings: TargetMapping;
    private categorizedCommand;
    private commandTarget;
    private category;
    private confidence;
    private worker;
    private workerReady;
    private modelLoaded;
    private workerError;
    private statusMessage;
    constructor();
    private initializeWorker;
    private handleWorkerMessage;
    private handleCommand;
    private processCategorization;
    private emitRefinedCommandEvent;
    render(): import("lit").TemplateResult<1>;
    disconnectedCallback(): void;
}
export {};
