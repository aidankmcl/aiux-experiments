export declare class MyButton extends HTMLElement {
    private props;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _: string, newValue: string): void;
    private handleClick;
    private render;
}
