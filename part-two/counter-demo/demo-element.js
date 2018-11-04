import { html, render } from 'https://unpkg.com/lit-html@0.12.0/lit-html.js?module';

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