import {LitElement, html} from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';

class TodoItem extends LitElement {
    static get properties() {
        return {
            text: String,
            checked: { type: Boolean, reflect: true },
            index: Number
        }
    }

    constructor() {
        super();
        this.checked = false;
    }

    _remove() {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
    }

    _toggle() {
        this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }));
    }

    render() {
        return html`
            <style>
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
                }
            </style>
            <li class="item">
                <input 
                    type="checkbox" 
                    ?checked=${this.checked} 
                    @change=${this._toggle}>
                </input>
                <label class=${this.checked ? 'completed' : ''}>${this.text}</label>
                <button @click=${this._remove}>❌</button>
            </li>
        `;
    }
}

window.customElements.define('to-do-item', TodoItem);