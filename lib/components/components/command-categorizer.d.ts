import { LitElement } from 'lit';
interface TargetMapping {
    [command: string]: string[];
}
export declare class CommandCategorizer extends LitElement {
    static styles: import("lit").CSSResult;
    modelName: string;
    targetMappings: TargetMapping;
    private categorizedCommand;
    private commandTarget;
    private category;
    private confidence;
    private classifier;
    constructor();
    initializeClassifier(): Promise<void>;
    private handleCommand;
    private categorizeCommand;
    private emitRefinedCommandEvent;
    render(): import("lit").TemplateResult<1>;
    disconnectedCallback(): void;
}
export {};
