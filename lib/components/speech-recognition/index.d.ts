import { LitElement } from 'lit';
export declare class SpeechCommand extends LitElement {
    static styles: import("lit").CSSResult;
    listening: boolean;
    nobutton: boolean;
    private worker;
    private workerReady;
    private workerError;
    private recognition;
    constructor();
    private initializeWorker;
    private handleWorkerMessage;
    disconnectedCallback(): void;
    private emitCommandEvent;
    startListening(): void;
    stopListening(): void;
    isListening(): boolean;
    private toggleListening;
    render(): import("lit").TemplateResult<1>;
}
