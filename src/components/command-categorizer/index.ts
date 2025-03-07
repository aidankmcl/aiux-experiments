import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  categorizerWorkerURL,
  cleanupCategorizerWorker,
  CategorizerWorkerInMessage,
  CategorizerWorkerOutMessage
} from './categorizer-worker';

interface TargetMapping {
  [command: string]: string[]
}

@customElement('command-categorizer')
export class CommandCategorizer extends LitElement {
  static styles = css`
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

  @property({ type: String }) modelName = 'Xenova/nli-deberta-v3-small';
  @property({ type: Boolean }) debug = false;
  @state() targetMappings: TargetMapping = {};
  @state() private categorizedCommand: string = '';
  @state() private commandTarget: string = '';
  @state() private category: string = 'unknown';
  @state() private confidence: number = 0;
  @state() private worker: Worker | null = null;
  @state() private workerReady: boolean = false;
  @state() private modelLoaded: boolean = false;
  @state() private workerError: string | null = null;
  @state() private statusMessage: string = 'Initializing...';

  constructor() {
    super();
    // Initialize the worker using the TypeScript-generated URL
    this.initializeWorker();

    // Listen for commands from speech-recognition component
    this.addEventListener('request-categorization', this.handleCommand.bind(this));
  }

  private initializeWorker() {
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
    } catch (error) {
      console.error('Failed to initialize command categorizer worker:', error);
      this.workerError = `Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  private handleWorkerMessage(event: MessageEvent<CategorizerWorkerOutMessage>) {
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
          } as CategorizerWorkerInMessage);
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
  private async handleCommand(event: CustomEvent<RequestCategorization>) {
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
  private processCategorization(data: any) {
    const { originalCommand, category, confidence, detectedTargets } = data;
    
    this.categorizedCommand = originalCommand;
    this.category = category;
    this.confidence = confidence;
    this.commandTarget = detectedTargets[0] || '';

    // Emit refined command event
    this.emitRefinedCommandEvent(originalCommand, category, confidence, detectedTargets);
  }

  // Emit refined command event
  private emitRefinedCommandEvent(
    command: string,
    category: string,
    confidence: number,
    detectedTargets: string[]
  ) {
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

    return html`
      <div id="categorizer">
        ${this.workerError ? html`<div class="error">${this.workerError}</div>` : ''}
        ${!this.modelLoaded ? html`<div class="status">${this.statusMessage}</div>` : ''}
        
        Commands: ${Object.keys(this.targetMappings).join(", ")}<br>
        Objects: ${mappedObjects.map(target => target.split(',')[0]).join(", ")}<br>
        ${this.categorizedCommand ? html`
          <div class="result">
            Command: ${this.categorizedCommand}<br>
            Category: ${this.category} (${(this.confidence * 100).toFixed(2)}%)<br>
            Target: ${this.commandTarget}
          </div>
        ` : html`<p>Waiting for command...</p>`}
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
}
