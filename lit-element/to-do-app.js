import {LitElement, html} from 'https://unpkg.com/@polymer/lit-element@latest/lit-element.js?module';
import {repeat} from 'https://unpkg.com/lit-html@0.12.0/directives/repeat.js?module';
import './to-do-item.js';

class TodoApp extends LitElement {
    static get properties() {
        return {
            todos: Array
        }
    }

    constructor() {
        super();
        this.todos = [];
    }

    firstUpdated() {
        this.$input = this.shadowRoot.querySelector('input');
    }

    _removeTodo(e) {
        this.todos = this.todos.filter((todo, index) => {
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
        if(this.$input.value.length > 0){
            this.todos = [...this.todos, { text: this.$input.value, checked: false }];
            this.$input.value = '';
        }
    }

    render() {
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
                ${repeat(this.todos, 
                    (todo) => todo, 
                    (todo, index) => html`
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


/*
Hey guys, ran into a good use case of using the `repeat` directive over `.map` while implementing lit-html to take care of rendering in my raw web component.
So in my repeat, I'm rendering a `<to-do-item>` that has an `<input type="checkbox">`, a label, and a button.
If I check the checkbox at index 4 of the array ("Reflecting properties to attributes"), and then delete, say, the 2nd index ("Setting properties") of the array, `.map` will result in the following:
SCREENSHOT
and the `repeat` directive results in the following:
SCREENSHOT

I just want to double check with you to see if my explanation of this is correct. Using `.map` will keep the dom nodes in the same place, but simply changes the values of the array in the templates placeholders
and `repeat` will actually move the dom nodes around? What's throwing me off though is that the checkbox is still checked. Is that because the input doesnt reflect properties to attributes?
*/