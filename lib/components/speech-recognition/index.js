import { __decorate } from '../../node_modules/.pnpm/@rollup_plugin-typescript@12.1.2_rollup@4.34.9_tslib@2.8.1_typescript@5.8.2/node_modules/tslib/tslib.es6.js';
import '../../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.js';
import { html as x } from '../../node_modules/.pnpm/lit-html@3.2.1/node_modules/lit-html/lit-html.js';
import { LitElement as r$1 } from '../../node_modules/.pnpm/lit-element@4.1.1/node_modules/lit-element/lit-element.js';
import { customElement as t } from '../../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.js';
import { property as n } from '../../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.js';
import { state as r } from '../../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/state.js';
import { getSpeechWorker, cleanupSpeechWorker } from './speech-worker.js';
import { css as i } from '../../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.js';

let SpeechCommand = class SpeechCommand extends r$1 {
    constructor() {
        super();
        // Properties and state
        this.listening = false;
        this.nobutton = false;
        this.worker = null;
        this.workerReady = false;
        this.workerError = null;
        this.transcript = '';
        this.interimTranscript = '';
        // Initialize worker
        this.initializeWorker();
    }
    initializeWorker() {
        try {
            // Create the web worker from our TypeScript-generated URL
            this.worker = getSpeechWorker();
            // Set up message handling
            this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
            // Handle worker errors
            this.worker.addEventListener('error', (error) => {
                console.error('Speech recognition worker error:', error);
                this.workerError = `Worker error: ${error.message || 'Unknown error'}`;
                this.workerReady = false;
            });
        }
        catch (error) {
            console.error('Failed to initialize speech recognition worker:', error);
            this.workerError = `Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    handleWorkerMessage(event) {
        const { type, data } = event.data;
        switch (type) {
            case 'ready':
                console.log('Speech recognition worker is ready');
                this.workerReady = true;
                this.workerError = null;
                break;
            case 'transcript':
                if (data.isFinal) {
                    this.transcript = data.transcript;
                    this.interimTranscript = '';
                    this.emitCommandEvent(data.transcript);
                }
                else {
                    this.interimTranscript = data.transcript;
                }
                break;
            case 'listening_state':
                this.listening = data.listening;
                if (!data.listening) {
                    this.dispatchEvent(new CustomEvent('listening-stopped', {
                        bubbles: true,
                        composed: true
                    }));
                }
                else {
                    this.dispatchEvent(new CustomEvent('listening-started', {
                        bubbles: true,
                        composed: true
                    }));
                }
                break;
            case 'error':
                console.error('Worker error:', data.message, data.error);
                this.workerError = `${data.message}: ${data.error}`;
                break;
            default:
                console.log('Unknown message from speech worker:', type);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up worker when component is removed
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            // Revoke the object URL
            cleanupSpeechWorker();
        }
    }
    // Emit custom event with command details
    emitCommandEvent(command) {
        this.dispatchEvent(new CustomEvent('speech-detected', {
            detail: {
                originalCommand: command,
                timestamp: Date.now()
            },
            bubbles: true,
            composed: true
        }));
    }
    // Public method to start listening
    startListening() {
        console.log('Starting speech recognition', !!this.worker, this.workerReady);
        if (this.worker && this.workerReady && !this.listening) {
            this.worker.postMessage({
                type: 'start_recognition',
                data: { lang: 'en-US' }
            });
        }
    }
    // Public method to stop listening
    stopListening() {
        if (this.worker && this.workerReady && this.listening) {
            this.worker.postMessage({
                type: 'stop_recognition'
            });
        }
    }
    // Public method to check if currently listening
    isListening() {
        return this.listening;
    }
    // Toggle speech recognition
    toggleListening() {
        if (this.listening) {
            this.stopListening();
        }
        else {
            this.startListening();
        }
    }
    // Render the component
    render() {
        if (this.nobutton) {
            return x ``;
        }
        return x `
      <div id="speech-recognition-wrapper">
        ${this.workerError ? x `<div class="error">${this.workerError}</div>` : ''}
        <button
          @click=${this.toggleListening}
          ?disabled=${!this.workerReady}
          class=${this.listening ? 'listening' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          ${this.listening ? 'Stop Listening' : 'Start Listening'}
        </button>
        ${this.transcript || this.interimTranscript ? x `
          <div class="transcript">
            ${this.transcript}
            <span class="interim">${this.interimTranscript}</span>
          </div>
        ` : ''}
      </div>
    `;
    }
};
// Styles for the component
SpeechCommand.styles = i `
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
    #speech-recognition-wrapper {

    }
    button {
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background-color 0.2s;
    }
    button:hover {
      background-color: #3367d6;
    }
    button.listening {
      background-color: #ea4335;
      animation: pulse 1.5s infinite;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    button svg {
      width: 18px;
      height: 18px;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    .transcript {
      margin-top: 10px;
      padding: 10px;
      border-radius: 4px;
    }
  `;
__decorate([
    n({ type: Boolean })
], SpeechCommand.prototype, "listening", void 0);
__decorate([
    n({ type: Boolean })
], SpeechCommand.prototype, "nobutton", void 0);
__decorate([
    r()
], SpeechCommand.prototype, "worker", void 0);
__decorate([
    r()
], SpeechCommand.prototype, "workerReady", void 0);
__decorate([
    r()
], SpeechCommand.prototype, "workerError", void 0);
__decorate([
    r()
], SpeechCommand.prototype, "transcript", void 0);
__decorate([
    r()
], SpeechCommand.prototype, "interimTranscript", void 0);
SpeechCommand = __decorate([
    t('speech-recognition')
], SpeechCommand);

export { SpeechCommand };
//# sourceMappingURL=index.js.map
