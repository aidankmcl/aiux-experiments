import { LitElement } from 'lit';
export declare class SpeechCommand extends LitElement {
    static styles: import("lit").CSSResult;
    listening: boolean;
    nobutton: boolean;
    private recognition;
    constructor();
    private emitCommandEvent;
    startListening(): void;
    stopListening(): void;
    isListening(): boolean;
    private toggleListening;
    render(): import("lit").TemplateResult<1>;
}
