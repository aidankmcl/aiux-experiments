interface MyButtonProps {
  label: string;
  onClick?: () => void;
}

export class MyButton extends HTMLElement {
  private props: MyButtonProps = {
    label: 'Click me'
  };

  static get observedAttributes(): string[] {
    return ['label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.addEventListener('click', this.handleClick.bind(this));
  }

  attributeChangedCallback(name: string, _: string, newValue: string): void {
    if (name === 'label') {
      this.props.label = newValue;
      this.render();
    }
  }

  private handleClick(): void {
    if (this.props.onClick) {
      this.props.onClick();
    }
    this.dispatchEvent(new CustomEvent('button-click', {
      bubbles: true,
      composed: true
    }));
  }

  private render(): void {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          button {
            padding: 8px 16px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: sans-serif;
          }
          button:hover {
            background-color: #3367d6;
          }
        </style>
        <button>${this.props.label}</button>
      `;
    }
  }
}

// Define the custom element
customElements.define('my-button', MyButton);
