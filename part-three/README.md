
##💥 LitElement 💥

Lit-html and LitElement finally got their official (1.0 and 2.0 respectively) releases, and that makes it a great time to wrap up the Web Components: from Zero to Hero blog series. I hope you've found these blogs useful as you've read them; they've been a blast to write, and I very much appreciate all the feedback and response I've gotten!

> Huh? A 2.0 release? Lit-element has moved away from the `@polymer/lit-element` namespace, to simply: `lit-element`. The `lit-element` npm package was previously owned by someone else and had already had a release, hence the 2.0 release.

Let's get to it!

In the last blog post we learned how to implement lit-html to take care of templating for our web component. Let's quickly recap the distinction between lit-html and lit-element:

- Lit-html is a _render_ library. It provides the _what_ and the _how_.
- LitElement is a web component base class. It provides the _when_ and the _where_.

I also want to stress that LitElement is _not_ a framework. It is simply a base class that extends `HTMLElement`. We can look at LitElement as an _enhancement_ of the standard `HTMLElement` class, that will take care of our properties and attributes management, as well as a more refined rendering pipeline for us. 

Lets take a quick look at our `to-do-item` component, rewritten with LitElement. You can find the full demo [here](https://stackblitz.com/edit/web-components-zero-to-hero-part-three), and on the [github](https://github.com/thepassle/webcomponents-from-zero-to-hero/tree/part-three) page:

```js
import { LitElement, html, css } from 'https://unpkg.com/lit-element@latest/lit-element.js?module';

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
            index: { type: Number }
        }
    }

    constructor() {
        super();
        // set some default values
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
			}
    	`;
    }

    render() {
        return html`
            <li class="item">
                <input 
                    type="checkbox" 
                    ?checked=${this.checked} 
                    @change=${() => this._fire('onToggle')}>
                </input>
                <label class=${this.checked ? 'completed' : ''}>${this.text}</label>
                <button @click=${() => this._fire('onRemove')}>❌</button>
            </li>
        `;
    }
}
```

###Properties and attributes

Let's get straight into it. The first thing you might notice is that all of our setters and getters are gone, and have been replaced with LitElement's static properties getter. This is _great_, because we've abstracted away a lot of boiler plate code and instead let LitElement take care of it.

So lets see how this works:

```js
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
        index: { type: Number }
    }
}
```

We can use the static properties getter to declare any attributes and properties we might need, and even pass some options to them. In this code, we've set a `text`, `checked`, and `index` property, and we'll _reflect_ the `text` and `checked` properties to attributes as well. Just like that. Remember how much work that was before? We had a whole [chapter](https://github.com/thepassle/webcomponents-from-zero-to-hero#-reflecting-properties-to-attributes) dedicated to reflecting properties to attributes!

We can even specify _how_ we want attributes to be reflected:

```js
static get properties() {
    return {
        text: { 
            type: String,
            reflect: true,
            attribute: 'todo'
        }
    }
}
```

Will reflect the text property in our DOM as the following attribute:

```html
<to-do-item todo="Finish blog"></to-do-item>
```

> Are you still confused about how reflecting properties to attributes works? Consider re-visiting [part one](https://github.com/thepassle/webcomponents-from-zero-to-hero#-reflecting-properties-to-attributes) of this blog series to catch up.

Additionally, and perhaps most importantly, the static properties getter will react to changes and trigger a rerender when a property has changed. We no longer have to call render functions manually to update, we just need to update a property, and LitElement will do all the work for us.

> ✨ _Hey! Listen!_
> 
> You _can_ still use custom getters and setters, but you'll have to manually call `this.requestUpdate()` to trigger a rerender. Custom getters and setters can be useful for computed properties.

###♻️ Lifecycle and rerendering

Finally, let's take a look at our `to-do-app` component:

```js
import { LitElement, html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
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
	        }
	        ul {
	            list-style: none;
	            padding: 0;
	        }
		`;
	}

    render() {
        return html`
            <h1>To do</h1>
            <form id="todo-input">
                <input type="text" placeholder="Add a new to do"></input>
                <button @click=${this._addTodo}>✅</button>
            </form>
            <ul id="todos">
                ${repeat(this.todos, 
                   (todo) => todo.text, 
                   (todo, index) => html`
                     <to-do-item 
                       .checked=${todo.checked}
                       .index=${index}
                       .text=${todo.text}
                       @onRemove=${this._removeTodo}
                       @onToggle=${this._toggleTodo}>    
                    </to-do-item>`
                  )}
            </ul>
        `;
    }
}

window.customElements.define('to-do-app', TodoApp);
```

You'll notice that we've changed our functions up a little bit. We did this, because in order for LitElement to pick up changes and trigger a rerender, we need to _immutably_ set arrays or objects. You _can_ still use mutable patterns to change nested object properties or objects in arrays, but you'll have to request a rerender manually by calling `this.requestUpdate()`, which could look like this:

```js
_someFunction(newValue) {
	this.myObj.value = newValue;
	this.requestUpdate();
}
```

Which brings us to LitElement's lifecycle. It's important to note that `LitElement` _extends_ `HTMLElement`, which means that we'll still have access to the standard lifecycle callbacks like `connectedCallback`, `disconnectedCallback`, etc.

Additionally, LitElement comes with some lifecycle callbacks of it's own. You can see a full example of LitElement's lifecycle [here](https://stackblitz.com/edit/open-wc-lit-demos?file=02-intermediate%2F03-lifecycle.js).

### `shouldUpdate()`

You can implement `shouldUpdate()` to control if updating and rendering should occur when property values change or requestUpdate() is called. This can be useful for when you _don't_ want to rerender.

### `firstUpdated()`

`firstUpdated` is called when... well, your element has been updated the first time. This method can be useful for querying dom in your component.

### `updated()`

Called right after your element has been updated and rerendered. You can implement this to perform post-updating tasks via DOM APIs, for example, focusing an element. Setting properties inside this method will *not* trigger another update.

And as I mentioned before, you can still implement `connectedCallback()` and `disconnectedCallback()`.


### Conclusion

If you've made it all this way; congratulations! You are now a web components super hero. I hope this blog series was helpful and informative to you, and that it may function as a reference for when you need to remember something about web components.

If you're interested in getting started with Web Components, make sure to check out [open-wc](www.open-wc.org). Open-wc provides recommendations including anything betwixt and between: developing, linting, testing, tooling, demoing, publishing and automating, and will help you get started in no time.

If you want to stay up to date with the lit-html/LitElement community, I recommend checking out the [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html) repo, or joining the [Polymer slack](https://polymer.slack.com).

Feel free to reach out to me on [twitter](https://www.twitter.com/passle_) if you have any questions.
