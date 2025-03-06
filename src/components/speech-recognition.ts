import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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

  // Speech recognition instance
  private recognition: SpeechRecognition | null = null;

  constructor() {
    super();
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

    // // Setup event listeners for speech recognition
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const command = event.results[0][0].transcript;
      this.emitCommandEvent(command);
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
