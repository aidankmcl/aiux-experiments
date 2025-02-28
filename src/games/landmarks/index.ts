import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../components/speech-command';

// import '../../components/command-categorizer';
import { CommandCategorizer } from '../../components/command-categorizer';

interface Landmark {
  name: string;
  x: number;
  y: number;
}

@customElement('ai-voice-game')
export class AIVoiceGame extends LitElement {
  static styles = css`
    #game-holder {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    #game {
      position: absolute;
      top: 1em;
      left: 1em;
      right: 1em;
      bottom: 1em;
      border-radius: 20px;
      background-color: #f0f0f0;
    }
    .landmark,
    #character {
      position: absolute;
      max-width: 100px;
      max-height: 200px;
      transition: left 1s linear, top 1s linear;
    }
    #controls {
      text-align: center;
      margin-top: 10px;
    }
    button {
      margin-right: 10px;
    }
  `;

  // Define landmarks as fixed positions.
  private landmarks: Landmark[] = [
    { name: 'movie', x: 10, y: 10 },
    { name: 'game', x: 70, y: 50 },
    { name: 'shoe', x: 40, y: 80 },
    { name: 'furniture', x: 50, y: 10 },
    { name: 'watch', x: 20, y: 50 }
  ];

  // Character position state.
  @property({ type: Number })
  characterX: number = 0;

  @property({ type: Number })
  characterY: number = 0;

  // Reference for speech recognition, if available.
  recognition: SpeechRecognition | null = null;

  render() {
    const landmarkNames = this.landmarks.map((l) => l.name);
    const targetMapping = JSON.stringify({
      move: landmarkNames,
      remove: landmarkNames,
      party: landmarkNames
    });

    return html`
      <div id="game-holder">
        <div id="game">
          ${this.landmarks.map(
      (landmark) => html`
              <img
                src="https://via.assets.so/${landmark.name}.png"
                class="landmark"
                alt="${landmark.name}"
                data-name="${landmark.name}"
                style="left: ${landmark.x}%; top: ${landmark.y}%;"
              />
            `
    )}
          <img
            src="https://vignette.wikia.nocookie.net/nickelodeon/images/d/d9/DoodleBob.png/revision/latest?cb=20181228054254"
            id="character"
            alt="Character"
            style="left: ${this.characterX}px; top: ${this.characterY}px;"
          />
        </div>
      </div>
      <speech-command @command="${this.onCommand}"></speech-command>
      <command-categorizer id="categorizer" .data="${targetMapping}"></command-categorizer>
    `;
  }

  updated() {
    const categorizer = this.shadowRoot?.getElementById('categorizer') as CommandCategorizer;
    if (!categorizer) return;

    this.addEventListener('refined-command', (e) => {
      const { action, target } = e.detail;
      if (action === 'move' && target) {
        const landmark = this.landmarks.find(l => l.name === target);
        if (landmark) {
          this.moveCharacterTo(landmark.x, landmark.y);
        }
      }
    });
  }

  onCommand(e: CustomEvent<{ command: string }>) {
    this.handleCommand(e.detail.command);
  }

  onCategorize(e: CustomEvent<{ command: string }>) {
    this.handleCommand(e.detail.command);
  }

  // Parse the user command to detect which landmark is referenced.
  parseCommand(command: string): string | null {
    command = command.toLowerCase();
    for (const landmark of this.landmarks) {
      if (command.includes(landmark.name)) {
        return landmark.name;
      }
    }
    return null;
  }

  // Handle both voice and text commands.
  handleCommand(command: string) {
    console.log(command);
    const landmarkName = this.parseCommand(command);
    if (landmarkName) {
      const target = this.landmarks.find((l) => l.name === landmarkName);
      if (target) {
        this.moveCharacterTo(target.x, target.y);
      }
    } else {
      alert('Could not recognize a landmark in your command.');
    }
  }

  // Update the character's position.
  moveCharacterTo(x: number, y: number) {
    this.characterX = x;
    this.characterY = y;
  }
}
