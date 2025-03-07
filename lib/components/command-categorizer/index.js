import { __decorate } from '../../node_modules/.pnpm/@rollup_plugin-typescript@11.1.6_rollup@3.29.5_tslib@2.8.1_typescript@5.8.2/node_modules/tslib/tslib.es6.js';
import '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/reactive-element.js';
import { html as x } from '../../node_modules/.pnpm/lit-html@2.8.0/node_modules/lit-html/lit-html.js';
import { LitElement as s } from '../../node_modules/.pnpm/lit-element@3.3.3/node_modules/lit-element/lit-element.js';
import { customElement as e } from '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/decorators/custom-element.js';
import { property as n } from '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/decorators/property.js';
import { state as t } from '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/decorators/state.js';
import '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/decorators/query-assigned-elements.js';
import { categorizerWorkerURL, cleanupCategorizerWorker } from './categorizer-worker.js';
import { css as i } from '../../node_modules/.pnpm/@lit_reactive-element@1.6.3/node_modules/@lit/reactive-element/css-tag.js';

let CommandCategorizer = class CommandCategorizer extends s {
    constructor() {
        super();
        this.modelName = 'Xenova/nli-deberta-v3-small';
        this.debug = false;
        this.targetMappings = {};
        this.categorizedCommand = '';
        this.commandTarget = '';
        this.category = 'unknown';
        this.confidence = 0;
        this.worker = null;
        this.workerReady = false;
        this.modelLoaded = false;
        this.workerError = null;
        this.statusMessage = 'Initializing...';
        // Initialize the worker using the TypeScript-generated URL
        this.initializeWorker();
        // Listen for commands from speech-recognition component
        this.addEventListener('request-categorization', this.handleCommand.bind(this));
    }
    initializeWorker() {
        try {
            // Create the web worker from our TypeScript-generated URL
            this.worker = new Worker(categorizerWorkerURL);
            // Set up message handling
            this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
            // Handle worker errors
            this.worker.addEventListener('error', (error) => {
                console.error('Command categorizer worker error:', error);
                this.workerError = `Worker error: ${error.message || 'Unknown error'}`;
                this.workerReady = false;
            });
        }
        catch (error) {
            console.error('Failed to initialize command categorizer worker:', error);
            this.workerError = `Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    handleWorkerMessage(event) {
        const { type, data } = event.data;
        switch (type) {
            case 'ready':
                console.log('Command categorizer worker is ready');
                this.workerReady = true;
                this.statusMessage = 'Worker ready, loading model...';
                // Initialize the model once worker is ready
                if (this.worker) {
                    this.worker.postMessage({
                        type: 'initialize',
                        data: { modelName: this.modelName }
                    });
                }
                break;
            case 'status':
                this.statusMessage = data.message;
                break;
            case 'model_loaded':
                console.log('Model loaded successfully');
                this.modelLoaded = true;
                this.statusMessage = 'Model loaded successfully';
                this.workerError = null;
                break;
            case 'categorization_result':
                this.processCategorization(data);
                break;
            case 'error':
                console.error('Worker reported error:', data.message, data.error);
                this.workerError = `${data.message}: ${data.error}`;
                break;
            default:
                console.log('Unknown message from categorizer worker:', type);
        }
    }
    // Handle incoming command from speech-recognition
    async handleCommand(event) {
        const detail = event.detail;
        const { command, targetMappings } = detail;
        console.log('categorizer got event', command, targetMappings);
        this.targetMappings = targetMappings;
        this.categorizedCommand = command;
        if (!this.worker || !this.workerReady || !this.modelLoaded) {
            console.error('Categorizer worker not ready or model not loaded');
            // Emit a basic event even when worker isn't available
            this.emitRefinedCommandEvent(command, 'unknown', 0, []);
            return;
        }
        // Send command to worker for categorization
        this.worker.postMessage({
            type: 'categorize',
            data: { command, targetMappings }
        });
    }
    // Process categorization results from worker
    processCategorization(data) {
        const { originalCommand, category, confidence, detectedTargets } = data;
        this.categorizedCommand = originalCommand;
        this.category = category;
        this.confidence = confidence;
        this.commandTarget = detectedTargets[0] || '';
        // Emit refined command event
        this.emitRefinedCommandEvent(originalCommand, category, confidence, detectedTargets);
    }
    // Emit refined command event
    emitRefinedCommandEvent(command, category, confidence, detectedTargets) {
        this.dispatchEvent(new CustomEvent('complete-categorization', {
            detail: {
                originalCommand: command,
                category,
                confidence,
                timestamp: Date.now(),
                detectedTargets
            },
            bubbles: true,
            composed: true
        }));
    }
    render() {
        const mappedObjects = Object.keys(this.targetMappings).length ? this.targetMappings[Object.keys(this.targetMappings)[0]] : [];
        return x `
      <div id="categorizer">
        ${this.workerError ? x `<div class="error">${this.workerError}</div>` : ''}
        ${!this.modelLoaded ? x `<div class="status">${this.statusMessage}</div>` : ''}
        
        Commands: ${Object.keys(this.targetMappings).join(", ")}<br>
        Objects: ${mappedObjects.map(target => target.split(',')[0]).join(", ")}<br>
        ${this.categorizedCommand ? x `
          <div class="result">
            Command: ${this.categorizedCommand}<br>
            Category: ${this.category} (${(this.confidence * 100).toFixed(2)}%)<br>
            Target: ${this.commandTarget}
          </div>
        ` : x `<p>Waiting for command...</p>`}
      </div>
    `;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up worker when component is removed
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            // Revoke the object URL
            cleanupCategorizerWorker();
        }
        this.removeEventListener('request-categorization', this.handleCommand.bind(this));
    }
};
CommandCategorizer.styles = i `
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }

    :host(:not([debug])) {
      display: none;
    }

    #categorizer {
      padding: 0.1em 1em;
      border-radius: 4px;
    }

    .result {
      display: block;
      margin-top: 10px;
    }
  `;
__decorate([
    n({ type: String })
], CommandCategorizer.prototype, "modelName", void 0);
__decorate([
    n({ type: Boolean })
], CommandCategorizer.prototype, "debug", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "targetMappings", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "categorizedCommand", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "commandTarget", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "category", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "confidence", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "worker", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "workerReady", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "modelLoaded", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "workerError", void 0);
__decorate([
    t()
], CommandCategorizer.prototype, "statusMessage", void 0);
CommandCategorizer = __decorate([
    e('command-categorizer')
], CommandCategorizer);

export { CommandCategorizer };
//# sourceMappingURL=index.js.map
