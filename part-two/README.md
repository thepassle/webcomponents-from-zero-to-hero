# Web components: from zero to hero, part two
## _Supercharging web components_

- [Lit-html](#-lit-html)
- [Lit-html in practice](#-lit-html-in-practice)
- [Supercharging our component](#-supercharging-our-component)
- [Attributes, properties, and events](#-attributes-properties-and-events)
- [Wrapping up](#-wrapping-up)

If you've followed along with [part one](https://github.com/thepassle/webcomponents-from-zero-to-hero/tree/master/part-one) of this blog series, you'll know the basics of web components by now. If you haven't, I suggest you go back to part one and catch up, because we'll be revisiting, and building on top of a lot of the concepts we covered in part one.

In this blog post, we'll be supercharging our to-do application with a rendering library called [lit-html](https://github.com/Polymer/lit-html). But before we dive in, there's a couple of things we need to discuss. If you've paid close attention, you'll have noticed that I referred to our web component as being a _raw_ web component before. I did that, because web components are _low level_, and don't include templating or other features _by design_. Web components were always intended as a collection of standards that do very specific things that the platform didn't allow yet.

I'd like to quote [Justin Fagnani](https://twitter.com/justinfagnani/status/1052216976586592257) by saying that all web components do is give the developer a _when_ and a _where_. The _when_ being element creation, instantiation, connecting, disconnecting, etc. The _where_ being the element instance and the shadowroot. What you do with that is up to you.

Additionally, lit-html is _not_ a framework. It's simply a javascript library that leverages standard javascript language features. The difference between libraries and frameworks is often a controversial subject, but I'd like to define it as this analogy by [Dave Cheney](https://twitter.com/davecheney/status/1058502133530542080):

> Frameworks are based on the Hollywood Pattern; don’t call us, we’ll call you.

Lit-html is also _extremely_ lightweight at <2kb, and renders _fast_.

Now that we've got that out of the way, let's see how lit-html works.

## 🔥 Lit-html

>- [x] Learn about Lit-html
>- [ ] Lit-html in practice
>- [ ] Supercharge our web component
>- [ ] Attributes, properties, and events
>- [ ] Wrapping up

Lit-html is a rendering library that lets you write HTML templates with javascript template literals, and efficiently render and re-render those templates to DOM. Tagged template literals are a feature of ES6 that can span multiple lines, and contain javascript expressions. A tagged template literal could look something like this:


```js
const planet = "world";

html`hello ${planet}!`;
```

Tagged template literals are just standard ES6 syntax. And these tags are actually just functions! Consider the following example:

```js
function customFunction(strings) {
    console.log(strings); // ["Hello universe!"]
}

customFunction`Hello universe!`;
```

They can also handle expressions:

```js
const planet = "world";

function customFunction(strings, ...values) {
    console.log(strings); // ["Hello ", "! five times two equals "]
    console.log(values); // ["world", 10]
}

customFunction`Hello ${planet}! five times two equals ${ 5 * 2 }`;
```

And if we look in the source code we can see this is exactly how lit-html works as well:

```js
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
export const html = (strings: TemplateStringsArray, ...values: any[]) =>
    new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
```
    
Now if we'd write something like this:

```js
const planet = "world";

function customFunction(strings, ...values) {
    console.log(strings); // ["<h1>some static content</h1><p>hello ", "</p><span>more static content</span>"]
    console.log(values); // ["world"]
}

customFunction`
	<h1>some static content</h1>
	<p>hello ${planet}</p>
	<span>more static content</span>	
`;
```
    
You'll notice that when we log our `strings` and `values` to the console, we've already separated the static content of our template, and the dynamic parts. This is great when we want to keep track of changes, and update our template with the corresponding data, because it allows us to only watch the _dynamic parts_ for changes. This is also a big difference with how VDOM works because we already _know_ the `<h1>` and the `<span>` are static, so we don't have to do anything with them. We're only interested in the dynamic parts, which can be any javascript expression. 

So lit-html takes your template, replaces all the expressions with generic placeholders called `Part`s, and makes a `<template>` element out of the result. So we now have a HTML template, that knows where it has to put any data it will receive. 

```html
<template>
	<h1>some static content</h1>
	<p>hello {{}}</p> <-- here's our placeholder, or `Part`
	<span>more static content</span>	
</template>
```

Lit remembers where these placeholders are, which allows for easy and efficient updates. Lit will also efficiently reuse `<template>`s:

```js
const sayHello = (name) => html`
	<h1>Hello ${name}</h1>
`;

sayHi('world');
sayHi('universe');
```

Both these templates will share the exact same `<template>` for efficiency, the only thing that's different is the data we're passing it. And if you paid close attention, you'll remember that we used the same technique in part one of this blog series.

The dynamic `Part`s of our template can be _any_ javascript expression. Lit-html doesn't even have to do any magic to evaluate our expressions, javascript just does this for us. Here are some examples:

Simple:

```js
customFunction`<p>${1 + 1}</p>`; // 2
```
Conditionals:

```js
customFunction`<p>${truthy ? 'yes' : 'no'}</p>`; // 'yes'
```

And we can even work with arrays and nesting:

```js
customFunction`<ul>${arr.map(item => customFunction`<li>${item}</li>`)}</ul>`;
```

## 🚀 Lit-html in practice

>- [x] Learn about Lit-html
>- [x] Lit-html in practice
>- [ ] Supercharge our web component
>- [ ] Attributes, properties, and events
>- [ ] Wrapping up

So let's see how this works in practice:

[![updating](http://thepassle.nl/SGTEST/litrendering.gif)](https://stackblitz.com/edit/web-components-zero-to-hero-counter?file=demo-element.js)

You can see the full demo [here](https://stackblitz.com/edit/web-components-zero-to-hero-counter?file=demo-element.js) or on [github](https://github.com/thepassle/webcomponents-from-zero-to-hero/tree/part-two/counter-demo). 

```js
import { html, render } from 'lit-html';

class DemoElement extends HTMLElement {
  constructor() {
    super();
    this._counter = 0;
    this._title = "Hello universe!";
    this.root = this.attachShadow({ mode: "open"});
    setInterval(() => {this.counter++}, 1000);
  }

  get counter() {
    return this._counter;
  }

  set counter(val) {
    this._counter = val;
    render(this.template(), this.root);
  }

  template() {
    return html`
      <p>Some static DOM</p>
      <h1>${this.counter}</h1>
      <h2>${this._title}</h2>
      <p>more static content</p>
    `;
  }
}

window.customElements.define('demo-element', DemoElement);
```

If you've read the first blog post in this series, this should look familiar. We've made a simple web component, that increments a counter every second, and we've implemented lit-html to take care of our rendering for us.

The interesting bits are here:

```js
    return html`
      <p>Some static DOM</p>
      <h1>${this.counter}</h1>
      <h2>${this._title}</h2>
      <p>more static content</p>
    `;
```

And the ouput in the DOM:

![litoutput](http://www.thepassle.nl/SGTEST/litrenderingoutput.png)

We can now see how lit _only_ updates the part of our code that has changed (`this.counter`), and doesn't even bother with the static parts. And it does all this without any framework magic or VDOM, and at less than 2kb library size! You also might notice a bunch of HTML comments in the output; Fear not, this is how lit-html keeps track of where static and dynamic parts are.


## ⚡️ Supercharging our component

>- [x] Learn about Lit-html
>- [x] Lit-html in practice
>- [x] Supercharge our web component
>- [ ] Attributes, properties, and events
>- [ ] Wrapping up

Now that we know how lit-html renders, lets put it in practice. You can see the full code [here](https://stackblitz.com/edit/web-components-zero-to-hero-part-two) and on [github](https://github.com/thepassle/webcomponents-from-zero-to-hero/tree/part-two). We'll be walking through this step by step, but lets get an overview of our supercharged component first:

`to-do-app.js`:

```js
import { html, render } from 'lit-html';
import './to-do-item.js';

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });

        this.todos = [
	    { text: 'Learn about Lit-html', checked: true },
	    { text: 'Lit-html in practice', checked: false },
	    { text: 'Supercharge our web component', checked: false },
	    { text: 'Attributes, properties, and events', checked: false },
	    { text: 'Wrapping up', checked: false }
	];

        render(this.template(), this._shadowRoot, {eventContext: this});

        this.$input = this._shadowRoot.querySelector('input');
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
                    background-color: Transparent;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
            </style>
            <h3>Raw web components + lit-html</h3>
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
```

Got the general overview? Great! You'll find quite a lot things have changed in our code, so let's take a closer look.

The first thing you might have noticed is that the way we handled the rendering of our component has completely changed. In our old app we had to imperatively create a `template` element, set its innerHTML, clone it, and append it to our shadowroot. When we wanted to update our component, we had to create a bunch of elements, set their attributes, add their event listeners and append them to the DOM. All by hand. I'm getting a headache just reading that. What we've done instead is delegate all the rendering to lit-html.

Now we only declare our template once, we can set attributes, properties and events _declaratively_ in the template, and just call lit-html's `render` function when we need to. The great thing about lit-html is that it's _fast_ and _efficient_ at rendering; It looks only at the dynamic expressions, and changes only what _needs_ to be updated. And all this without the overhead of a framework!


## 🔨 Attributes, properties, and events

>- [x] Learn about Lit-html
>- [x] Lit-html in practice
>- [x] Supercharge our web component
>- [x] Attributes, properties, and events
>- [ ] Wrapping up

Let's continue and take a look at how lit-html handles attributes, properties, and events.

```js
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
```

You might have seen this weird syntax in the updated version of our component, and wonder what it means. Lit-html allows us to _declaratively_ set our attributes, properties and event handlers in our templates, as opposed to setting them imperatively. Since we learned all about attributes, properties and events in part one of this series, this should be easy enough to follow. If you need a refresher, [I got you covered](https://github.com/thepassle/webcomponents-from-zero-to-hero/tree/master/part-one#-reflecting-properties-to-attributes).

Let's walk through all of this step by step.

### 💅 Attributes

```js
text=${todo.text}
```
We set _attributes_ in lit-html... Exactly like you'd set an attribute in standard HTML. The only difference is the fact that we're using a dynamic value in a template string. Very anticlimactic, I know. We previously had to set our attributes imperatively like this: `el.setAttribute('text', todo.text);`. 

> ✨ _Hey! Listen!_
> 
> Regular attributes are still only limited to String types!

### ☑️ Boolean attributes

```js
?checked=${todo.checked}
```

As you'll remember from the last blog post, Boolean attributes are generally handled a bit differently...

> #### ✨ _Flashback_ ✨
> ...
> 
> _This means that only the following examples are acceptable for a true value:_
>
>```html
><div hidden></div>
><div hidden=""></div>
><div hidden="hidden"></div>
>```
>_And one for false:_
>
>```html
><div></div>
>```

Conveniently enough, lit-html allows us to easily specify our attribute as a _Boolean_ attribute by prefixing the attribute name with a `?`, and then makes sure the attribute is either present on the element, or not.

Previously we set our boolean attributes as: 

```js
if(todo.checked){
	el.setAttribute('checked', '');
}
```

and omitted it altogether when our conditional was falsy. 

### 📂 Properties

```js
.index=${index}
```

If we want to pass down some rich data like arrays or objects, or in this case, a number value, we can simply use the dot prefix. 

Previously, to set _properties_ on our components, we had to imperatively query for the component, and set the property. Thanks to lit-html, we can handle all this in our template instead.

Previously we set properties as:

```js
el.index = index;
```

### 🎉 Events

```js
@onRemove=${this._removeTodo}
```

And finally, we can declaratively specify our event listeners by prefixing them with an `@`. Whenever the `to-do-item` component fires an `onRemove` event, `this._removeTodo` is called. Easy peasy.

Just to give you another example, here's how we could handle a click event:

```js
<button @click=${this._handleClick}></button>
```

> ✨ _Hey! Listen!_
> 
> Notice how we specified an `eventContext` in our `render()` function: `render(this.template(), this._shadowRoot, {eventContext: this});`. This makes sure we always have the correct reference to `this` in our event handlers, and makes it so we don't have to manually `.bind(this)` our event handlers in the `constructor`.


## 💭 Wrapping up

>- [x] Learn about Lit-html
>- [x] Lit-html in practice
>- [x] Supercharge our web component
>- [x] Attributes, properties, and events
>- [x] Wrapping up

If you made it all the way here, you're on your way to becoming a real Web Components hero. You've learned about lit-html, how lit-html renders, how to use attributes, properties and events, and how to implement lit-html to take care of the rendering of your Web Component.

Great job! We supercharged our web component, and it now efficiently renders to-do's, but we _still_ have a bunch of boilerplate code, and a lot of property and attribute management to take care of. It would be great if there would be an easier way to handle all this... 

...what?

...Is it a bird? 🐦

...Is it a plane? ✈️

It's... 

### 💥 LitElement 💥

Which we'll talk about in the next, and final part of this blog series. Thanks for reading!
