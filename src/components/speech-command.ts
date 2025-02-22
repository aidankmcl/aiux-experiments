import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
    button:hover {
      background-color: #45a049;
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
    };

    this.recognition.onend = () => {
      this.listening = false;
    };
  }

  // Emit custom event with command details
  private emitCommandEvent(command: string) {
    console.log('emitting command event', command);
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