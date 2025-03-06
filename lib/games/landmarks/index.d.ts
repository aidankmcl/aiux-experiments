import { LitElement } from 'lit';
import '../../components/speech-recognition';
export declare class AIVoiceGame extends LitElement {
    static styles: import("lit").CSSResult;
    private landmarks;
    characterX: number;
    characterY: number;
    recognition: SpeechRecognition | null;
    render(): import("lit").TemplateResult<1>;
    updated(): void;
    onCommand(e: CustomEvent<{
        command: string;
    }>): void;
    onCategorize(e: CustomEvent<{
        command: string;
    }>): void;
    parseCommand(command: string): string | null;
    handleCommand(command: string): void;
    moveCharacterTo(x: number, y: number): void;
}
