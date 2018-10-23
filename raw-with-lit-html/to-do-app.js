import {html, render} from 'https://unpkg.com/lit-html@0.12.0/lit-html.js?module';
import {repeat} from 'https://unpkg.com/lit-html@0.12.0/directives/repeat.js?module';
import './to-do-item.js';


/*
TO DO:
    - Make _toggle nicer
    - improve rendering the template, can probably abstract it in a render function
    - add repeat instead of .map
    - IN BLOG: For this 'stage' of upgrading our raw component:
        So this is pretty nice, but we still have to call `render` a bunch of times, 
        and we haven't done a whole lot to make our setting and getting attributes and properties easier.

https://github.com/Polymer/lit-html/issues/361
    Now you see that instead of rendering the list again, it only shuffles around the nodes,
    repeat() solves this by making it possible for lit-html to understand the relationship of items we are rendering. Basically, if you try to render the same item again, it will not create a new node, but instead move the item that we previously rendered to the right place. The key function is there to help lit understand which items are 'the same'.

Render arrays with .map if you are rendering 'pure' items that do not change their own state, and all the state is passed down by the render template. You cannot ever change the state of the rendered items in any way other than rendering them again, or you get the red 1 problem from the first example.

Render with repeat if you are rendering items that manage their own state and have no state passed down. Once the item is rendered it has to manage it's own state completely, since existing items will never be rendered again.
*/

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._todos = [];

        render(this.template(), this._shadowRoot);
        this.$input = this._shadowRoot.querySelector('input');
        this.$submitButton = this._shadowRoot.querySelector('button');
        this.$submitButton.addEventListener('click', this._addTodo.bind(this));

        this._removeTodo = this._removeTodo.bind(this);
        this._toggleTodo = this._toggleTodo.bind(this);
    }

    _removeTodo(e) {
        this._todos.splice(e.detail, 1);
        render(this.template(), this._shadowRoot);
    }

    _toggleTodo(e) {
        const todo = this._todos[e.detail];
        this._todos[e.detail] = Object.assign({}, todo, {
            checked: !todo.checked
        });

        render(this.template(), this._shadowRoot);
    }

    _addTodo(e) {
        e.preventDefault();
        if(this.$input.value.length > 0){
            this._todos.push({ text: this.$input.value, checked: false })
            render(this.template(), this._shadowRoot);
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
                <button>✅</button>
            </form>

            <ul id="todos">
                ${this.todos.map((todo, index) => {
                    return html`
                        <to-do-item 
                            ?checked=${todo.checked}
                            .index=${index}
                            text=${todo.text}
                            @onRemove=${this._removeTodo}
                            @onToggle=${this._toggleTodo}>    
                        </to-do-item>
                    `;
                })}
 
            </ul>
        `;
    }

    set todos(value) {
        this._todos = value;
        render(this.template(), this._shadowRoot);
    }

    get todos() {
        return this._todos;
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