import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { 
  speechWorkerURL, 
  cleanupSpeechWorker, 
  SpeechWorkerOutMessage 
} from './speech-worker';

@customElement('speech-recognition')
export class SpeechCommand extends LitElement {
  // Styles for the component
  static styles = css`
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

  // Properties and state
  @property({ type: Boolean }) listening = false;
  @property({ type: Boolean }) nobutton = false;
  @state() private worker: Worker | null = null;
  @state() private workerReady: boolean = false;
  @state() private workerError: string | null = null;

  // Speech recognition instance
  private recognition: SpeechRecognition | null = null;

  constructor() {
    super();
    // Initialize worker - now using the URL from our TypeScript worker file
    this.initializeWorker();
    
    // Initialize SpeechRecognition (with fallback for webkit)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser');
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    // Setup event listeners for speech recognition
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const command = event.results[0][0].transcript;
      // Send to worker for processing
      if (this.worker && this.workerReady) {
        this.worker.postMessage({
          type: 'process_command',
          data: { command }
        });
      } else {
        // Fallback if worker isn't ready
        this.emitCommandEvent(command);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      console.log(event);
      this.listening = false;
      this.dispatchEvent(new CustomEvent('listening-stopped', {
        bubbles: true,
        composed: true
      }));
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.dispatchEvent(new CustomEvent('listening-stopped', {
        bubbles: true,
        composed: true
      }));
    };
  }

  private initializeWorker() {
    try {
      // Create the web worker from our TypeScript-generated URL
      this.worker = new Worker(speechWorkerURL);
      
      // Set up message handling
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      
      // Handle worker errors
      this.worker.addEventListener('error', (error) => {
        console.error('Speech recognition worker error:', error);
        this.workerError = `Worker error: ${error.message || 'Unknown error'}`;
        this.workerReady = false;
      });
    } catch (error) {
      console.error('Failed to initialize speech recognition worker:', error);
      this.workerError = `Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  private handleWorkerMessage(event: MessageEvent<SpeechWorkerOutMessage>) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'ready':
        console.log('Speech recognition worker is ready');
        this.workerReady = true;
        this.workerError = null;
        break;
        
      case 'command_processed':
        this.emitCommandEvent(data.originalCommand);
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
  private emitCommandEvent(command: string) {
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
  public startListening() {
    console.log('Starting speech recognition', !!this.recognition, this.listening);
    if (this.recognition && !this.listening) {
      this.recognition.start();
      this.listening = true;
    }
  }

  // Public method to stop listening
  public stopListening() {
    if (this.recognition && this.listening) {
      this.recognition.stop();
      // The listening state will be updated in the onend event handler
    }
  }
  
  // Public method to check if currently listening
  public isListening(): boolean {
    return this.listening;
  }

  // Toggle speech recognition
  private toggleListening() {
    if (this.listening && this.recognition) {
      this.recognition.stop();
    } else {
      if (this.recognition) {
        this.recognition.start();
        this.listening = true;
      }
    }
  }

  // Render the component
  render() {
    if (this.nobutton) {
      return html``;
    }
    
    return html`
      <div id="speech-recognition-wrapper">
        ${this.workerError ? html`<div class="error">${this.workerError}</div>` : ''}
        <button
          @click=${this.toggleListening}
          ?disabled=${!window.SpeechRecognition && !window.webkitSpeechRecognition}
          class=${this.listening ? 'listening' : ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          ${this.listening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
    `;
  }
}
