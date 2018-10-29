# Web components: from zero to hero, part two
## _Supercharging web components_

If you've followed along with [part one](https://github.com/thepassle/webcomponents-from-zero-to-hero) of this blog series, you'll know the basics of web components by now. If you haven't, I suggest you go back to part one and catch up, because we'll be revisiting a lot of the concepts we covered in part one.

In this blog post, we'll be supercharging our to-do application with a rendering library called [lit-html](https://github.com/Polymer/lit-html). But before we dive in, there's a couple of things we need to discuss. If you've paid close attention, you'll have noticed that I referred to our web component as being a _raw_ web component before. I did that, because web components are _low level_, and don't include templating or other features _by design_. Web components were always intended as a collection of standards that do very specific things that the platform didn't allow yet.

I'd like to quote [Justin Fagnani](https://twitter.com/justinfagnani/status/1052216976586592257) by saying that all web components do is give the developer a _when_ and a _where_. The _when_ being element creation, instantiation, connecting, disconnecting, etc. The _where_ being the element instance and the shadowroot. What you do with that is up to you.

Additionally, lit-html is _not_ a framework. It's simply a javascript library that leverages standard javascript language features. It's also _extremely_ lightweight at <2kb, and renders _fast_.

Now that we've got that out of the way, let's see how lit-html works.

## Lit-html

Lit-html lets you write HTML templates with javascript template literals and efficiently render and re-render those templates to DOM. Tagged template literals are a feature of ES6 that can span multiple lines, and contain javascript expressions. A tagged template literal could look something like this:


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

And if we look in the source code we can see that's exactly what lit-html does:

```js
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
export const html = (strings: TemplateStringsArray, ...values: any[]) =>
    new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
```
    
Lit-html's `html` function doesn't return dom, it returns an object representing the template, called a `TemplateResult`. 

Difference with vdom is that the `<div>` up there are always static parts, so we don't have to do anything with that, we're only interested in the dynamic parts.

A `<template>` element is an inert fragment of DOM. Inside a `<template>`, script don't run, images don't load, custom elements aren't upgraded, etc. `<template>`s can be efficiently cloned. They're usually used to tell the HTML parser that a section of the document must not be instantiated when parsed, and will be managed by code at a later time, but it can also be created imperatively with createElement and innerHTML.

Lit-html creates HTML `<template>` elements from the tagged template literals, and then clone's them to create new DOM.

On the initial render it clones the template, then walks it using the remembered placeholder positions, to create Part objects.

A Part is a "hole" in the DOM where values can be injected. lit-html includes two type of parts by default: NodePart and AttributePart, which let you set text content and attribute values respectively. The Parts, container, and template they were created from are grouped together in an object called a TemplateInstance.

## Supercharging our component

Now that we know how lit-html renders, lets put it in practice. We'll be walking through this step by step, but lets get an overview of our supercharged component first:

`to-do-app.js`:

```js
import {html, render} from 'https://unpkg.com/lit-html@0.12.0/lit-html.js?module';
import './to-do-item.js';

class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._todos = [];

        render(this.template(), this._shadowRoot);
        this.$input = this._shadowRoot.querySelector('input');

        this._addTodo = this._addTodo.bind(this);
        this._toggleTodo = this._toggleTodo.bind(this);
        this._removeTodo = this._removeTodo.bind(this);
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
                <button @click=${this._addTodo}>✅</button>
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
```

Got the general overview? Great! You'll find quite a lot things have changed in our code, so let's take a closer look.

The first thing you might have noticed is that the way we handled the rendering of our component has completely changed. In our old app we had to imperatively create a `template` element, set its innerHTML, clone it, and append it to our shadowroot. When we wanted to update our component, we had to completely empty our list, create a bunch of new elements, set their attributes, add their event listeners and append them to the DOM. I'm getting a headache just reading that. What we've done instead is delegate all the rendering to lit-html.

Now we only declare our template once, we can set attributes, properties and events _declaratively_, and just call lit-html's `render` function when we need to. The great thing about lit-html is that it's _fast_ and _efficient_ at rendering; It looks only at the dynamic expressions, and changes only what _needs_ to be updated, instead of rerendering our list entirely for every change. And all this without the overhead of a framework or VDOM!

To see this in action, let's take a look at how our old app rendered todos:

![without-lit](http://thepassle.nl/SGTEST/withoutlit.gif)

And how our new app renders todos:

![with-lit](http://thepassle.nl/SGTEST/withlit.gif)


## Attributes, properties, and events

Let's move on and take a look at how lit-html handles attributes, properties, and expressions.

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

You might have seen this weird syntax in the updated version of our component, and wonder what it means. Lit-html allows us to _declaratively_ set our attributes, properties and event handlers in our templates. Since we learned all about attributes, properties and events in part one of this series, this should be easy enough to follow. If you need a refresher, [I got you covered](https://github.com/thepassle/webcomponents-from-zero-to-hero#-setting-properties).

Let's walk through all of this step by step.

### Attributes

```js
text=${todo.text}
```
We set _attributes_ in lit-html... Exactly like you'd set an attribute in standard HTML. The only difference is the fact that we're using a dynamic value in a template string. Very anticlimactic, I know. 

> ✨ _Hey! Listen!_
> 
> Standard attributes are still only limited to String types!

### Boolean attributes

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


Conveniently enough, lit-html allows us to easily specify our attribute as a _Boolean_ attribute by prefixing the attribute name with a `?`, and then makes sure the attribute is either present, or not.

### Properties

```js
.index=${index}
```

If we want to pass down some rich data like arrays or objects, or in this case, a number value, we can simply use the dot notation. 

Previously, to set _properties_ on our components, we had to imperatively query for the component, and set the property. Thanks to lit-html, we can handle this declaratively in our template instead.

### Event listeners

```js
@onRemove=${this._removeTodo}
```

And finally, we can declaratively specify our event listeners by prefixing them with an `@`. Whenever the `to-do-item` component fires an `onRemove` event, `this._removeTodo` is called. Easy peasy.

A similar example is:

```js
<button @click=${this._handleClick}></button>
```

> ✨ _Hey! Listen!_
> 
> Remember to `.bind(this)` your event handlers in the `constructor` to ensure we always have the correct reference to `this` in our handlers.




<br><br><br><br><br><br><br><br><br><br><br><br><br>


- Raw web components with lit-html
    - little bit about lit-html's rendering, tagged template literals, templateresult, static parts, expressions, markers
    - performance example in dev tools, which at, 2kb size (lithtml) is extremely lightweight
    - props vs attrs
    - repeat vs .map
        -> remember how in part 1 we talked about how the input doesnt reflect to attr etc
            lit-html doesnt think the value changed, so it doesnt rerender that particular checkbox. The checkbox did disappear, but that's because the property doesnt reflect to the attr. (remember how in part 1 etc)

Great, our application now efficiently renders to-do's, but we _still_ have a bunch of boilerplate code, and a lot of property and attribute management to take care of. 

- Web components with LitElement
    - triggering renders, immutably setting (but also immutable with this.requestUpdate)
- Conclusion

> ✨ _Hey! Listen!_
> 
> Only attributes listed in the `observedAttributes` getter are affected in the `attributeChangedCallback`.

