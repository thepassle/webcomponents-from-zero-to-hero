import { html, render } from 'https://unpkg.com/lit-html@0.12.0/lit-html.js?module';
import './to-do-item.js';

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this.todos = [];

        render(this.template(), this._shadowRoot, {eventContext: this});

        this.$input = this._shadowRoot.querySelector('input');
    }

    _removeTodo(e) {
        this._todos.splice(e.detail, 1);
        render(this.template(), this._shadowRoot, {eventContext: this});
    }

    _toggleTodo(e) {
        const todo = this._todos[e.detail];
        this._todos[e.detail] = Object.assign({}, todo, {
            checked: !todo.checked
        });

        render(this.template(), this._shadowRoot, {eventContext: this});
    }

    _addTodo(e) {
        e.preventDefault();
        if(this.$input.value.length > 0){
            this._todos.push({ text: this.$input.value, checked: false })
            render(this.template(), this._shadowRoot, {eventContext: this});
            this.$input.value = '';
        }
    }

    template() {
        return html`
            <style>
                :host {
                    display: block;
                    font-family: sans-serif;
                    text-align: center;
                }
                button {
                    border: none;
                    cursor: pointer;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
            </style>
            <h1>To do</h1>
            <form id="todo-input">
                <input type="text" placeholder="Add a new to do"></input>
                <button @click=${this._addTodo}>✅</button>
            </form>
            <ul id="todos">
              ${this.todos.map((todo, index) => html`
                    <to-do-item 
                        ?checked=${todo.checked}
                        .index=${index}
                        text=${todo.text}
                        @onRemove=${this._removeTodo}
                        @onToggle=${this._toggleTodo}>    
                    </to-do-item>
                  `
              )}
            </ul>
        `;
    }

    set todos(value) {
        this._todos = value;
        render(this.template(), this._shadowRoot, {eventContext: this});
    }

    get todos() {
        return this._todos;
    }
}

window.customElements.define('to-do-app', TodoApp);