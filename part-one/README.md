
# Web components: from zero to hero
## _An introduction to writing raw web components_

- [What are web components?](#-what-are-web-components)
- [A Components lifecycle](#-a-components-lifecycle)
- [Building our to-do app](#-building-our-to-do-app)
- [Setting properties](#-setting-properties)
- [Setting attributes](#-setting-attributes)
- [Reflecting properties to attributes](#-reflecting-properties-to-attributes)
- [Events](#-events)
- [Browser support and polyfills](#-browser-support-and-polyfills)
- [Wrapping up](#wrapping-up)

Web components are getting more and more traction. With the Edge team's recent announcement of implementing Custom Elements and Shadow DOM, all major browsers will soon support web components natively. Companies like Github, Netflix, Youtube and ING are even already using web components in production. Neat! However, surprisingly enough, none of those huge, succesful companies have implemented a (you guessed it) _to-do app!_

So today, we'll be making a to-do app, because the world doesn't have enough implementations of to-do apps yet. You can take a look at what we'll be making [here](https://thepassle.github.io/webcomponents-from-zero-to-hero/).

Before we start, I'd like to add a little disclaimer that this blogpost is intended to get a better grasp of the _basics_ of web components. Web components are low level, and should probably not be used to write full blown applications without the use of any helper libraries, nor should they be compared to full blown frameworks.

## 🙋 What are web components?

> - [x] Make a demo
> - [ ] The boring stuff
> - [ ] Setting properties
> - [ ] Setting attributes
> - [ ] Reflecting properties to attributes
> - [ ] Events
> - [ ] Wrap it up

First things first: [Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) are a set of standards that allow us to write modular, reusable and encapsulated HTML elements. And the best thing about them: since they're based on web standards, we don't have to install any framework or library to start using them. You can start writing web components using vanilla javascript, right now!

But before we start getting our hands dirty, lets take a look at the specifications that let us write web components.

### Custom Elements

The [Custom Elements](https://w3c.github.io/webcomponents/spec/custom/) api allows us to author our own DOM elements. Using the api, we can define a custom element, and inform the parser how to properly construct that element and how elements of that class should react to changes. Have you ever wanted your own HTML element, like `<my-cool-element>`? Now you can!

### Shadow DOM

[Shadow DOM](https://w3c.github.io/webcomponents/spec/custom/) gives us a way to encapsulate the styling and markup of our components. It's a sub DOM tree attached to a DOM element, to make sure none of our styling leaks out, or gets overwritten by any external styles. This makes it great for modularity.

### ES Modules

The [ES Modules](https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system) specification defines the inclusion and reuse of JS documents in a standards based, modular, performant way.

### HTML Templates

The [HTML `<template>`](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element/) tag allows us to write reusable chunks of DOM. Inside a template, scripts don't run, images don't load, and styling/mark up is not rendered. A template tag itself is not even considered to be in the document, _until it's activated_. HTML templates are great, because for every instance of our element, only 1 template is used.

Now that we know which specifications web components leverage, let's take a look at a custom element's lifecycle. I know, I know, we'll get to the code soon!

## ♻️ A component's lifecycle

Let's take a look at a custom element's lifecycle. Consider the following element:

```js
class MyElement extends HTMLElement {
    constructor() {
        // always call super() first
        super(); 
        console.log('constructed!');
    }
	
    connectedCallback() {
        console.log('connected!');
    }
	
    disconnectedCallback() {
        console.log('disconnected!');
    }
	
    attributeChangedCallback(name, oldVal, newVal) {
        console.log(`Attribute: ${name} changed!`);
    }
	
    adoptedCallback() {
        console.log('adopted!');
    }
}

window.customElements.define('my-element', MyElement);
```

### constructor()

The `constructor` runs whenever an element is created, but _before_ the element is attached to the document. We'll use the `constructor` for setting some initial state, event listeners, and creating the shadow DOM.

### connectedCallback()

The `connectedCallback` is called when the element is inserted to the DOM. It's a good place to run setup code, like fetching data, or setting default attributes.

### disconnectedCallback()

The `disconnectedCallback` is called whenever the element is removed from the DOM. Clean up time! We can use the `disconnectedCallback` to remove any event listeners, or cancel intervals.

### attributeChangedCallback(name, oldValue, newValue)

The `attributeChangedCallback` is called any time your element's _observed attributes_ change. We can observe an element's attributes by implementing a static `observedAttributes` getter, like so:

```js
static get observedAttributes() {
    return ['my-attr'];
}
```

In this case, any time the `my-attr` attribute is changed, the `attributeChangedCallback` will run. We'll go more in-depth on this later this blog post.

> ✨ _Hey! Listen!_
> 
> Only attributes listed in the `observedAttributes` getter are affected in the `attributeChangedCallback`.


### adoptedCallback()

The adoptedCallback is called each time the custom element is moved to a new document. You'll only run into this use case when you have `<iframe>` elements in your page.

### registering our element

And finally, though not part of the lifecycle, we register our element to the `CustomElementRegistry` like so:

```js
window.customElements.define('my-element', MyElement);
```

The `CustomElementRegistry` is an interface that provides methods for registering custom elements and querying registered elements. The first argument of the registries' `define` method will be the name of the element, so in this case it'll register `<my-element>`, and the second argument passes the class we made.

> ✨ _Hey! Listen!_
>
> It's important to note how we name our web components. Custom element names must always contain a hyphen. For example: `<my-element>` is correct, and `<myelement>` is not. This is done deliberately to avoid clashing element names, and to create a distinction between custom elements and regular elements.
> 
> Custom elements also cannot be self-closing because HTML only allows a few elements to be self-closing. These are called _void elements_, like `<br/>` or `<img/>`, or elements that don't allow children nodes.
> 
> Allowing self-closing elements would require a change in the HTML parser, which is a problem since HTML parsing is security sensitive. HTML producers need to be able to rely on how a given piece of HTML parses in order to be able to implement XSS-safe HTML generation.

## ⚒ Building our to do app

> - [x] Make a demo
> - [x] The boring stuff
> - [ ] Setting properties
> - [ ] Setting attributes
> - [ ] Reflecting properties to attributes
> - [ ] Events
> - [ ] Wrap it up

Now that we're done with all the boring stuff, we can finally get our hands dirty and start building our to do app! Click [here](https://thepassle.github.io/webcomponents-from-zero-to-hero/) to see the end result.

Let's start with an overview of what we're going to build.

- A `<to-do-app>` element:
	- Contains an array of to-do's as _property_
	- Adds a to-do
	- Removes a to-do
	- Toggles a to-do

- A `<to-do-item>` element:
	- Contains a description _attribute_
	- Contains an index _attribute_
	- Contains a checked _attribute_
	
Great! Let's lay out the groundwork for our to-do-app:

`to-do-app.js`:

```js
const template = document.createElement('template');
template.innerHTML = `
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

<input type="text" placeholder="Add a new to do"></input>
<button>✅</button>

<ul id="todos"></ul>
`;

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this.$todoList = this._shadowRoot.querySelector('ul');
    }
}

window.customElements.define('to-do-app', TodoApp);
```

We're going to take this step by step. We first create a `<template>` by calling `const template = document.createElement('template');`, and then we set some HTML in it. We only set the innerHTML on the template _once_. The reason we're using a template is because cloning templates is much cheaper than calling `.innerHTML` for all instances of our component.

Next up, we can actually start defining our element. We'll use our `constructor` to _attach_ our shadowroot, and we'll set it to `open` mode. Then we'll _clone_ our template to our shadowroot. Cool! We've now already made use of 2 web components specifications, and succesfully made an encapsulated sub DOM tree.

What this means is that we now have a DOM tree that will not leak any styles, or get any styles overwritten. Consider the following example:

![encapsulation](https://i.imgur.com/llF84Na.png)

We have a global `h1` styling that makes any h1 in the light DOM a red color. But because we have our h1 in a shadow-root, it does not get overwritten by the global style.

Note how in our `to-do-app` component, we've used a `:host` pseudo class, this is how we can add styling to the component from the inside. An important thing to note is that the `display` is always set to `display: inline;`, which means you can't set a width or height on your element. So make sure to set a `:host` display style (e.g. block, inline-block, flex) unless you prefer the default of inline.

> ✨ _Hey! Listen!_
> 
> Shadow DOM can be a little confusing. Allow me to expand a little bit on terminology:
>
> ### Light DOM:
>
> The light DOM lives outside the component's shadow DOM, and is basically anything that is _not_ shadow DOM. For example, the `<h1>Hello world</h1>` up there lives in the light DOM. The term light DOM is used to distinguish it from the Shadow DOM. It's perfectly fine to make web components using light DOM, but you miss out on the great features of shadow DOM.
> 
> ### Open shadow DOM:
> 
> Since the latest version (V1) of the shadow DOM specification, we can now use `open` or `closed` shadow DOM. Open shadow DOM allows us to create a sub DOM tree next to the light DOM to provide encapsulation for our components. Our shadow DOM can still be pierced by javascript like so: `document.querySelector('our-element').shadowRoot`. One of the downsides of shadow DOM is that web components are still relatively young, and many external libraries don't account for it.
> 
> ### Closed shadow DOM:
> 
> Closed shadow roots are not very applicable, as it prevents any external javascript from piercing the shadowroot. Closed shadow DOM makes your component less flexible for yourself and your end users and should generally be avoided.
>
> Some examples of elements that do use a closed shadow DOM are the `<video>` element.

## 📂 Setting properties

Cool. We've made our first web component, but as of now, it's absolutely useless. It would be nice to be able to pass some data to it and render a list of to-do's.

Let's implement some getters and setters.

`to-do-app.js`:

```js
class TodoApp extends HTMLElement {
    ...
 		
    _renderTodoList() {
        this.$todoList.innerHTML = '';

        this._todos.forEach((todo, index) => {
            let $todoItem = document.createElement('div');
            $todoItem.innerHTML = todo.text; 
            this.$todoList.appendChild($todoItem);
        });
    }

    set todos(value) {
        this._todos = value;
        this._renderTodoList();
    }

    get todos() {
        return this._todos;
    }
}
```

Now that we have some getters and setters, we can pass some rich data to our element! We can query for our component and set the data like so:

```js
document.querySelector('to-do-app').todos = [
    {text: "Make a to-do list", checked: false}, 
    {text: "Finish blog post", checked: false}
];
```

We've now succesfully set some _properties_ on our component, and it should currently look like this:

![todolist](https://i.imgur.com/I0IkxNp.png)

Great! Except it's still useless because we cannot interact with anything without using the console. Let's quickly implement some functionality to add new to-do's to our list.

```js
class TodoApp extends HTMLElement {
    ...

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$todoList = this._shadowRoot.querySelector('ul');
        this.$input = this._shadowRoot.querySelector('input');

        this.$submitButton = this._shadowRoot.querySelector('button');
        this.$submitButton.addEventListener('click', this._addTodo.bind(this));
    }

    _addTodo() {
        if(this.$input.value.length > 0){
            this._todos.push({ text: this.$input.value, checked: false })
            this._renderTodoList();
            this.$input.value = '';
        }
    }

    ...
}
```

This should be easy enough to follow, we set up some `querySelectors` and `addEventListeners` in our `constructor`, and on a click event we want to push the input to our to-do's list, render it, and clear the input again. Ez 👏.

![add](https://i.imgur.com/v7Qzi8b.png)
    
## 💅 Setting attributes

> - [x] Make a demo
> - [x] The boring stuff
> - [x] Setting properties
> - [ ] Setting attributes
> - [ ] Reflecting properties to attributes
> - [ ] Events
> - [ ] Wrap it up

This is where things will get confusing, as we'll be exploring the differences between _attributes_ and _properties_, and we'll also be _reflecting properties to attributes_. Hold on tight!

First, let's create a `<to-do-item>` element.

`to-do-item.js`:

```js
const template = document.createElement('template');
template.innerHTML = `
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

        this.$item = this._shadowRoot.querySelector('.item');
        this.$removeButton = this._shadowRoot.querySelector('button');
        this.$text = this._shadowRoot.querySelector('label');
        this.$checkbox = this._shadowRoot.querySelector('input');

        this.$removeButton.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
        });

        this.$checkbox.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }));
        });
    }

    connectedCallback() {
    	// We set a default attribute here; if our end user hasn't provided one,
    	// our element will display a "placeholder" text instead.
        if(!this.hasAttribute('text')) {
            this.setAttribute('text', 'placeholder');
        }

        this._renderTodoItem();
    }

    _renderTodoItem() {
        if (this.hasAttribute('checked')) {
            this.$item.classList.add('completed');
            this.$checkbox.setAttribute('checked', '');
        } else {
            this.$item.classList.remove('completed');
            this.$checkbox.removeAttribute('checked');
        }
        
        this.$text.innerHTML = this._text;
    }

    static get observedAttributes() {
        return ['text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._text = newValue;
    }
}
window.customElements.define('to-do-item', TodoItem);

```
> Note that since we're using a ES Modules, we're able to use `const template = document.createElement('template');` again, without overriding the previous template we made.

And lets change our `_renderTodolist` function in `to-do-app.js` to this:

```js
class TodoApp extends HTMLElement {

    	...

        _renderTodoList() {
            this.$todoList.innerHTML = '';

            this._todos.forEach((todo, index) => {
                let $todoItem = document.createElement('to-do-item');
                $todoItem.setAttribute('text', todo.text);
                this.$todoList.appendChild($todoItem);
            });
        }
        
        ...
		 
    }
```

Alright, a lot of different stuff is going on here. Let's dive in. Previously, when passing some _rich data_ (an array) to our `<to-do-app>` component, we set it like this:

```js
document.querySelector('to-do-app').todos = [{ ... }];
```

We did that, because `todos` is a _property_ of the element. _Attributes_ are handled differently, and don't allow rich data, in fact, they only allow a String type as a limitation of HTML. Properties are more flexible and can handle complex data types like Objects or Arrays.

The difference is that attributes are defined on HTML elements. When the browser parses the HTML, a corresponding DOM node will be created. This node is an object, and therefore it has _properties_. For example, when the browser parses: `<to-do-item index="1">`, a [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) object will be created. This object already contains several properties, such as `children`, `clientHeight`, `classList`, etc, as well as some methods like `appendChild()` or `click()`. We can also implement our own properties, like we did in our `to-do-app` element, which we gave a `todos` property.

Here's an example of this in action.

```html
<img src="myimg.png" alt="my image"/>
```

The browser will parse this `<img>` element, create a [DOM Element object](https://www.w3schools.com/jsref/dom_obj_all.asp), and conveniently set the properties for `src` and `alt` for us. It should be mentioned that this property reflection is not true for _all_ attributes. (Eg: the `value` attribute on an `<input>` element does not reflect. The `value` _property_ of the `<input>` will always be the current text content of the `<input>`, and the `value` _attribute_ will be the initial text content.) We’ll go deeper into reflecting properties to attributes shortly.

So we now know that the alt and src _attributes_ are handled as String types, and that if we'd want to pass our array of to-do's to our `<to-do-app>` element like this:

```html
<to-do-app todos="[{...}, {...}]"></to-do-app>
```

We would not get the desired result; we're expecting an array, but actually, the value is simply a String that looks like an array.
	
> ✨ _Hey! Listen!_
> 
> - Aim to only accept rich data (objects, arrays) as properties.
> - Do not reflect rich data properties to attributes.
	
_Setting_ attributes works differently from properties as well, notice how we didn't implement any getters or setters. We added our `text` attribute to the `static get observedAttributes` getter, to allow us to watch for changes on the `text` attribute. And we implemented the `attributesChangedCallback` to react to those changes.

Our app should look like this, at this moment in time:

![todos](https://i.imgur.com/j9k2CQk.png)
	
### Boolean attributes

We're not done with attributes just yet. It would be nice to be able to check off some of our to-do's when we're done with them, and we'll be using attributes for that as well. We have to handle our Boolean attributes a little differently though.

> The presence of a boolean attribute on an element represents the `True` value, and the absence of the attribute represents the `False` value.

> If the attribute is present, its value must either be the empty string or a value that is an ASCII case-insensitive match for the attribute's canonical name, with no leading or trailing whitespace.

> The values "true" and "false" are not allowed on boolean attributes. To represent a false value, the attribute has to be omitted altogether. `<div hidden="true">` is incorrect.

This means that only the following examples are acceptable for a true value:

```html
<div hidden></div>
<div hidden=""></div>
<div hidden="hidden"></div>
```
And one for false:

```html
<div></div>
```

So let's implement the `checked` attribute for our `<to-do-item>` element!

Change your `to-do-app.js` to this:

```js
_renderTodoList() {
    this.$todoList.innerHTML = '';

    this._todos.forEach((todo, index) => {
        let $todoItem = document.createElement('to-do-item');
        $todoItem.setAttribute('text', todo.text);

	// if our to-do is checked, set the attribute, else; omit it.
        if(todo.checked) {
            $todoItem.setAttribute('checked', '');                
        }

        this.$todoList.appendChild($todoItem);
    });
}
```

And change `to-do-item` to this:

```js
 class TodoItem extends HTMLElement {

    ...

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

    ...

}
```

Nice! Our application should look like this:

![checked](https://i.imgur.com/SO3rCJU.png)
	
## ♺ Reflecting properties to attributes
	
> - [x] Make a demo
> - [x] The boring stuff
> - [x] Setting properties
> - [x] Setting attributes
> - [ ] Reflecting properties to attributes
> - [ ] Events
> - [ ] Wrap it up
    
Cool, our app is coming along nicely. But it would be nice if our end user would be able to query for the status of `checked` of our `to-do-item` component. We've currently set it only as an _attribute_, but we would like to have it available as a _property_ as well. This is called _reflecting properties to attributes_.
	
All we have to do for this is add some getters and setters. Add the following to your `to-do-item.js`:

```js
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
```

Now, every time we change the property or the attribute, the value will always be in sync.

## 🎉 Events

> - [x] Make a demo
> - [x] The boring stuff
> - [x] Setting properties
> - [x] Setting attributes
> - [x] Reflecting properties to attributes
> - [ ] Events
> - [ ] Wrap it up

Phew, now that we're done with the hard bits, it's time to get to the fun stuff. Our application currently handles and exposes the data in a way we want to, but it doesn't actually remove or toggle the to-do's yet. Let's take care of that.

First, we're going to have to keep track of the `index` of our `to-do-item`s. Let's set up an attribute!

`to-do-item.js`:

```js
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
}
```

Note how we're parsing the String type value to an integer here, since attributes only allow a String type, but we'd like the end user to be able to get the index _property_ as an integer. And we also now have a nice example of how to deal with string/number/boolean attributes and how to handle attributes and properties as their actual type.

So let's add some getters and setters to `to-do-item.js`:

```js
set index(val) {
    this.setAttribute('index', val);
}

get index() {
    return this._index;
}
```
	
And change our `_renderTodoList` function in `to-do-app.js` to:

```js
_renderTodoList() {
    this.$todoList.innerHTML = '';

    this._todos.forEach((todo, index) => {
        let $todoItem = document.createElement('to-do-item');
        $todoItem.setAttribute('text', todo.text);

        if(todo.checked) {
            $todoItem.setAttribute('checked', '');                
	}

        $todoItem.setAttribute('index', index);
        
        $todoItem.addEventListener('onRemove', this._removeTodo.bind(this));

        this.$todoList.appendChild($todoItem);
    });
}
```	

Note how we're setting `$todoItem.setAttribute('index', index);`. We now have some state to keep track of the index of the to-do. We've also set up an event listener to listen for an `onRemove` event on the `to-do-item` element.

Next, we'll have to _fire_ the event when we click the remove button. Change the `constructor` of `to-do-item.js` to the following:

```js
constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.$item = this._shadowRoot.querySelector('.item');
    this.$removeButton = this._shadowRoot.querySelector('button');
    this.$text = this._shadowRoot.querySelector('label');
    this.$checkbox = this._shadowRoot.querySelector('input');

    this.$removeButton.addEventListener('click', (e) => {
        this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
    });
}
```

> ✨ _Hey! Listen!_
> 
> We can set `{ detail: this.index, composed: true, bubbles: true }` to let the event bubble out of our components shadow DOM.



And add the `_removeTodo` function in `to-do-app.js`:

```js
_removeTodo(e) {
    this._todos.splice(e.detail, 1);
    this._renderTodoList();
}
```

Sweet! We're able to delete to-do's:

![remove](https://i.imgur.com/uudJaJH.png)

And finally, let's create a toggle functionality as well.

`to-do-app.js`:

```js
class TodoApp extends HTMLElement {
    ...
   
    _toggleTodo(e) {
        const todo = this._todos[e.detail];
        this._todos[e.detail] = Object.assign({}, todo, {
            checked: !todo.checked
        });
        this._renderTodoList();
    }


    _renderTodoList() {
        this.$todoList.innerHTML = '';

        this._todos.forEach((todo, index) => {
            let $todoItem = document.createElement('to-do-item');
            $todoItem.setAttribute('text', todo.text);

            if(todo.checked) {
                $todoItem.setAttribute('checked', '');                
            }

            $todoItem.setAttribute('index', index);
            $todoItem.addEventListener('onRemove', this._removeTodo.bind(this));
            $todoItem.addEventListener('onToggle', this._toggleTodo.bind(this));

            this.$todoList.appendChild($todoItem);
        });
    }
	
    ...

}

```

And `to-do-item.js`:

```js
class TodoItem extends HTMLElement {

    ...
	
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.$item = this._shadowRoot.querySelector('.item');
        this.$removeButton = this._shadowRoot.querySelector('button');
        this.$text = this._shadowRoot.querySelector('label');
        this.$checkbox = this._shadowRoot.querySelector('input');

        this.$removeButton.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index }));
        });

        this.$checkbox.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index }));
        });
    }
    
    ...

}
```

![toggle](https://i.imgur.com/mE9dcX8.png)

Success! We can create, delete, and toggle to-do's!

## 👻 Browser support and polyfills

> - [x] Make a demo
> - [x] The boring stuff
> - [x] Setting properties
> - [x] Setting attributes
> - [x] Reflecting properties to attributes
> - [x] Events
> - [ ] Wrap it up

The last thing I'd like to address in this blog post is browser support. At time of writing, [the Microsoft Edge team has recently announced](https://twitter.com/MSEdgeUpdates/status/1049404076499320835) that they'll be implementing [custom elements](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/customelements/) as well as [shadow DOM](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/shadowdom/), meaning that **all** major browsers will soon natively support web components. 

Until that time, you can make use of the [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs) polyfills, maintained by Google. Simply import the polyfill:

```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.0.0/webcomponents-bundle.js"></script>
```

I used unpkg for simplicity's sake, but you can also install webcomponentsjs with `NPM`. To make sure the polyfills have succesfully loaded, we can wait for the `WebComponentsReady` event to be fired, like so: 

```js
window.addEventListener('WebComponentsReady', function() {
    console.log('Web components ready!');
    // your web components here
});
```

## 💫 Wrapping up

> - [x] Make a demo
> - [x] The boring stuff
> - [x] Setting properties
> - [x] Setting attributes
> - [x] Reflecting properties to attributes
> - [x] Events
> - [x] Wrap it up

> Done! 

If you've made it all the way down here, congratulations! You've learned about the web components specifications, (light/open/closed) shadow DOM, templates, the difference between attributes and properties, and reflecting properties to attributes.

But as you can probably tell, a lot of the code that we've written may feel a little clunky, we've written quite a lot of boiler plate (getters, setters, queryselectors, etc), and a lot of things have been handled imperatively. Our updates to the to do list aren't very performant, either.

"_Web components are neat, but I don't want to spend all this time writing boiler plate and setting stuff imperatively, I want to write declarative code!_", you cry. 

Enter [lit-html](https://polymer.github.io/lit-html/), which we'll cover in the next blog post.
