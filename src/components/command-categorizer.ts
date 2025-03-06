import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { pipeline, env, ZeroShotClassificationOutput } from '@huggingface/transformers';

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

    #categorizer {
      background: rgba(0, 0, 0, 0.5);
      padding: 0.1em 1em;
      border-radius: 4px;
    }

    .result {
      display: block;
      margin-top: 10px;
    }
  `;

  @property({ type: String }) modelName = 'Xenova/nli-deberta-v3-small';
  @state() targetMappings: TargetMapping = {};
  @state() private categorizedCommand: string = '';
  @state() private commandTarget: string = '';
  @state() private category: string = 'unknown';
  @state() private confidence: number = 0;

  private classifier: (text: string, labels: string[]) => Promise<ZeroShotClassificationOutput> = () => Promise.resolve({ labels: [], sequence: "", scores: [] });

  constructor() {
    super();

    // Configure Transformers.js environment
    env.allowLocalModels = false; // Prevent loading local models
    // env.localModelPath = '/models/'; // Adjust path if needed for local model storage

    // Initialize the classifier
    this.initializeClassifier();

    // Listen for commands from speech-recognition component
    this.addEventListener('request-categorization', this.handleCommand.bind(this));
  }

  async initializeClassifier() {
    try {
      // Load ALBERT Base v2 for sequence classification
      const pipe = await pipeline('zero-shot-classification', this.modelName);
      this.classifier = (text, labels) => pipe(text, labels)
        .then((output) => {
          if (Array.isArray(output)) return output[0];
          return output;
        });
    } catch (error) {
      console.error('Failed to initialize classifier:', error);
    }
  }

  // Handle incoming command from speech-recognition
  private async handleCommand(event: CustomEvent<RequestCategorization>) {
    const detail = event.detail;
    const { command, targetMappings } = detail;

    if (!this.classifier) {
      console.error('Classifier not ready');
      return;
    }

    // Categorize the command using ALBERT Base v2
    const result = await this.categorizeCommand(command, targetMappings);
    this.categorizedCommand = command;
    this.commandTarget = result.detectedTargets[0];
    this.category = result.category;
    this.confidence = result.confidence;

    // Emit refined command event
    this.emitRefinedCommandEvent(command, result.category, result.confidence, result.detectedTargets);
  }

  // Categorize command using ALBERT Base v2
  private async categorizeCommand(command: string, targetMappings: TargetMapping = {}): Promise<{
    category: string;
    confidence: number;
    detectedTargets: string[];
  }> {
    this.targetMappings = targetMappings;

    try {
      if (!this.classifier) throw new Error('Classifier not ready');

      const output = await this.classifier(command, Object.keys(targetMappings));
      const category = output.labels[0];
      const confidence = output.scores[0];

      // Then, if we have landmarks for this category, check for them
      const detectedTargets: string[] = [];
      const mapping = targetMappings[category];

      if (mapping && mapping.length) {
        const targetOutput = await this.classifier(
          command,
          mapping as string[]
        );

        // Only include landmarks with confidence > 0.5
        detectedTargets.push(
          ...targetOutput.labels.filter((_, i) =>
            targetOutput.scores[i] > 0.5
          )
        );
      }

      return { category, confidence, detectedTargets };
    } catch (error) {
      console.error('Categorization error:', error);
      return { category: 'unknown', confidence: 0, detectedTargets: [] };
    }
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
    this.removeEventListener('request-categorization', this.handleCommand.bind(this));
  }
}

// Example usage:
/*
<speech-recognition></speech-recognition>
<command-categorizer></command-categorizer>

<script>
  const categorizer = document.querySelector('command-categorizer');
  categorizer.addEventListener('refined-command', (e) => {
    console.log('Refined command:', e.detail);
  });
</script>
*/