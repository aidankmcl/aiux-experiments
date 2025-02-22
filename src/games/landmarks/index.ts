import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../components/speech-command';

// import '../../components/command-categorizer';
import { CommandCategorizer, CompleteCategorizationEventDetail } from '../../components/command-categorizer';

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
      max-width: 150px;
      max-height: 250px;
      transition: left 1s linear, top 1s linear;
    }
    #controls {
      text-align: center;
      margin-top: 10px;
    }
    button {
      margin-right: 10px;
    }
    #ui {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    #ui speech-command {
      text-align: right;
      cursor: pointer;
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

  private targetMappings = {
    move: this.landmarks.map((l) => l.name),
    take: this.landmarks.map((l) => l.name),
    drop: [],
    party: [],
  };

  private technoColors = [
    '#00ff41', // Matrix green
    '#0ff0fc', // Cyan
    '#ff00ff', // Magenta
    '#4b0082', // Indigo
    '#7b00ff', // Electric purple
    '#1e90ff', // Dodger blue
    '#00ffb3', // Neon turquoise
  ];

  // Character position state.
  @property({ type: Number })
  characterX: number = 45;

  @property({ type: Number })
  characterY: number = 45;

  @property({ type: CommandCategorizer })
  categorizer: CommandCategorizer | null = null;

  // New property to track the item the player is holding
  @property({ type: String })
  holdingItem: string | null = null;

  // Reference for speech recognition, if available.
  recognition: SpeechRecognition | null = null;

  render() {
    return html`
      <div id="game-holder">
        <div id="game">
          ${this.landmarks.map((landmark) => {
            const landmarkX = this.holdingItem === landmark.name ? this.characterX : landmark.x;
            const landmarkY = this.holdingItem === landmark.name ? this.characterY : landmark.y;
            return html`
              <img
                src="https://via.assets.so/${landmark.name.split(',')[0]}.png"
                class="landmark"
                alt="${landmark.name}"
                data-name="${landmark.name}"
                style="left: ${landmarkX}%; top: ${landmarkY}%;"
              />
            `
          })}
          <img
            src="https://vignette.wikia.nocookie.net/nickelodeon/images/d/d9/DoodleBob.png/revision/latest?cb=20181228054254"
            id="character"
            alt="Character"
            style="left: ${this.characterX}%; top: ${this.characterY}%;"
          />
        </div>
      </div>
      <div id="ui">
        <command-categorizer id="categorizer" .targetMappings="${this.targetMappings}" @complete-categorization="${this.onCategorize}"></command-categorizer>
        <speech-command @command-detected="${this.onCommand}"></speech-command>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  onCommand(e: CustomEvent<{ originalCommand: string }>) {    
    this.dispatchEvent(new CustomEvent('request-categorization', {
      detail: { command: e.detail.originalCommand },
      bubbles: true,
      composed: true
    }));
  }

  onCategorize(e: CustomEvent<CompleteCategorizationEventDetail>) {
    const { category, detectedTargets } = e.detail;
    switch (category) {
      case 'move':
        if (detectedTargets.length) {
          const target = this.landmarks.find(l => l.name === detectedTargets[0]);
          if (target) {
            this.moveCharacterTo(target.x, target.y);
          }
        }
        break;
      case 'take':
        if (detectedTargets.length) {
          const target = this.landmarks.find(l => l.name === detectedTargets[0]);
          if (target) {
            this.moveCharacterTo(target.x, target.y);
            this.holdingItem = target.name;
          }
        }
        break;
      case 'drop':
        if (this.holdingItem) {
          // Drop the held item
          this.holdingItem = null;
        }
        break;
      case 'party':
        this.partyDance();
        break;
      default:
        break;
    }
  }

  // Modified partyDance to shift background colors and play sound.
  partyDance() {
    const partySound = new Audio('/doodlebob.mp3');
    partySound.play();
    let moves = 10;

    const gameDiv = this.shadowRoot?.querySelector('#game') as HTMLElement;

    const dance = () => {
      if (moves > 0) {
        const randomX = Math.floor(Math.random() * 90);
        const randomY = Math.floor(Math.random() * 90);
        this.moveCharacterTo(randomX, randomY);
        const randomColor = this.technoColors[Math.floor(Math.random() * this.technoColors.length)] + '80'; // 80 = 50% opacity

        if (gameDiv) {
          gameDiv.style.backgroundColor = randomColor;
        }
        moves--;
        setTimeout(dance, 500);
      }

      if (moves === 0) {
        // Reset background color after the dance
        if (gameDiv) {
          gameDiv.style.backgroundColor = '#f0f0f0';
        }
      }
    };
    dance();
  }

  // Update the character's position.
  moveCharacterTo(x: number, y: number) {
    this.characterX = x;
    this.characterY = y;
  }
}
