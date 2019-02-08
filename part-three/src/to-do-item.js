import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module';

class TodoItem extends LitElement {
  static get properties() {
    return {
      text: { 
        type: String,
        reflect: true
      },
      checked: { 
        type: Boolean, 
        reflect: true 
      },
      index: { 
        type: Number 
      }
    }
  }

  constructor() {
    super();
    this.text = '';
    this.checked = false;
  }

  _fire(eventType) {
    this.dispatchEvent(new CustomEvent(eventType, { detail: this.index }));   
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: sans-serif;
      }
      .completed {
        text-decoration: line-through;
      }
      button {
        cursor: pointer;
        border: none;
        background-color: Transparent;
      }
    `;
  }

  render() {
    return html`
        <li class="item">
            <input 
                type="checkbox" 
                .checked=${this.checked} 
                @change=${() => this._fire('onToggle')}>
            </input>
            <label class=${this.checked ? 'completed' : ''}>${this.text}</label>
            <button @click=${() => this._fire('onRemove')}>❌</button>
        </li>
    `;
  }
}

window.customElements.define('to-do-item', TodoItem);