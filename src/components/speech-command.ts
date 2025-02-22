import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Define available command categories
type CommandCategory = 'navigation' | 'action' | 'query' | 'unknown';

// Interface for the emitted event detail
interface CommandEventDetail {
  originalCommand: string;
  timestamp: number;
}

@customElement('speech-command')
export class SpeechCommand extends LitElement {
  // Styles for the component
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
    #speech-command-wrapper {
      position: absolute;
      bottom: 0;
      right: 0;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .transcript {
      margin-top: 10px;
      padding: 10px;
      border-radius: 4px;
    }
  `;

  // Properties and state
  @property({ type: Boolean }) listening = false;
  @state() private transcript = '';
  @state() private category: CommandCategory = 'unknown';

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

    // Setup event listeners for speech recognition
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const command = event.results[0][0].transcript;
      console.log("recognition", event.results);
      this.transcript = command;
      // this.category = this.categorizeCommand(command);
      // this.emitCommandEvent(command, this.category);
      this.emitCommandEvent(command);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.listening = false;
    };

    this.recognition.onend = () => {
      this.listening = false;
    };
  }

  // Emit custom event with command details
  private emitCommandEvent(command: string) {
    const eventDetail: CommandEventDetail = {
      originalCommand: command,
      timestamp: Date.now()
    };

    this.dispatchEvent(new CustomEvent<CommandEventDetail>('command-detected', {
      detail: eventDetail,
      bubbles: true,
      composed: true
    }));
  }

  // Toggle speech recognition
  private toggleListening() {
    if (this.listening && this.recognition) {
      this.recognition.stop();
    } else {
      this.transcript = '';
      this.category = 'unknown';
      if (this.recognition) {
        this.recognition.start();
        this.listening = true;
      }
    }
  }

  // Render the component
  render() {
    return html`
      <div id="speech-command-wrapper">
        <button
          @click=${this.toggleListening}
          ?disabled=${!window.SpeechRecognition && !window.webkitSpeechRecognition}
        >
          ${this.listening ? 'Stop Listening' : 'Start Listening'}
        </button>
        ${this.transcript ? html`
          <div class="transcript">
            Command: ${this.transcript}
          </div>
      ` : ''}
      </div>
    `;
  }
}

// Example usage in HTML:
/*
<speech-command></speech-command>

<script>
  const speechComp = document.querySelector('speech-command');
  speechComp.addEventListener('command-detected', (e) => {
    console.log('Command detected:', e.detail);
    // Handle the command in another component
  });
</script>
*/