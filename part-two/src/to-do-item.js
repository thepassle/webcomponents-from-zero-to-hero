import { html, render } from 'https://unpkg.com/lit-html@0.12.0/lit-html.js?module';

class TodoItem extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    }

    connectedCallback() {
        if(!this.hasAttribute('text')) {
            this.setAttribute('text', 'placeholder');
        }
        render(this.template(), this._shadowRoot, {eventContext: this});
    }

    _fireToggle(e) {
        this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }));
    }
    _fireRemove(e) {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
    }

    template() {
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
                    border: none;
                    cursor: pointer;
                }
            </style>
            <li class="item">
                <input 
                    type="checkbox" 
                    .checked=${this._checked}
                    @change=${this._fireToggle}>
                <label class=${this._checked ? 'completed' : ''}>${this._text}</label>
                <button @click=${this._fireRemove}>❌</button>
            </li>
        `;
    }

    static get observedAttributes() {
        return ['text', 'checked', 'index'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name){
            case 'text':
                this._text = newValue;
                break;
            case 'checked':
                this._checked = this.hasAttribute('checked');
                break;
            case 'index':
                this._index = parseInt(newValue);
                break;
        }
        render(this.template(), this._shadowRoot, {eventContext: this});
    }

    set index(val) {
        this.setAttribute('index', val);
    }

    get index() {
        return this._index;
    }

    get checked() {
        return this.hasAttribute('checked');
    }

    set checked(val) {
        if (val) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
    }

}
window.customElements.define('to-do-item', TodoItem);