import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module';
import './to-do-item.js';

class TodoApp extends LitElement {
  static get properties() {
    return {
      todos: { type: Array }
    }
  }

  constructor() {
    super();
    this.todos = [
      { text: 'Make a demo', checked: true },
      { text: 'The boring stuff', checked: false },
      { text: 'Setting properties', checked: false },
      { text: 'Setting attributes', checked: false },
      { text: 'Reflecting properties to attributes', checked: false },
      { text: 'Events', checked: false },
      { text: 'Wrap it up', checked: false }
    ];
  }

  firstUpdated() {
    this.$input = this.shadowRoot.querySelector('input');
  }

  _removeTodo(e) {
    this.todos = this.todos.filter((todo,index) => {
        return index !== e.detail;
    });
  }

  _toggleTodo(e) {
    this.todos = this.todos.map((todo, index) => {
        return index === e.detail ? {...todo, checked: !todo.checked} : todo;
    });
  }

  _addTodo(e) {
    e.preventDefault();
    if(this.$input.value.length > 0) {
        this.todos = [...this.todos, { text: this.$input.value, checked: false }];
        this.$input.value = '';
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: sans-serif;
        text-align: center;
      }
      button {
        border: none;
        cursor: pointer;
        background-color: Transparent;
      }
      ul {
        list-style: none;
        padding: 0;
      }
    `;
  }

  render() {
    return html`
      <h3>LitElement</h3>
      <br>
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
                </to-do-item>`
            )}
      </ul>
    `;
  }
}

window.customElements.define('to-do-app', TodoApp);