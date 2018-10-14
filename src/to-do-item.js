

(() => {
    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            :host {
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
            <input type="checkbox">
            <label></label>
            <button>❌</button>
        </li>
    `;

    class TodoItem extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ 'mode': 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._text = '';
        }

        connectedCallback() {
            this.$item = this._shadowRoot.querySelector('.item');
            this.$removeButton = this._shadowRoot.querySelector('button');
            this.$text = this._shadowRoot.querySelector('label');
            this.$checkbox = this._shadowRoot.querySelector('input');

            this.$removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
            });

            this.$checkbox.addEventListener('click', (e) => {
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }));
            });

            this._renderTodo();
        }

        static get observedAttributes() {
            return ['text', 'checked'];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch(name){
                case 'text':
                    this._text = newValue;
                    break;
                case 'checked':
                    this._checked = this.hasAttribute('checked');
                    break;
            }
        }

        set index(val) {
            this._index = val;
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

        _renderTodo() {
            this.$text.innerHTML = this._text;
            if (this._checked) {
                this.$item.classList.add('completed');
                this.$checkbox.setAttribute('checked', '');
            } else {
                this.$item.classList.remove('completed');
                this.$checkbox.removeAttribute('checked');
            }
        }

    }
    window.customElements.define('to-do-item', TodoItem);
})();

