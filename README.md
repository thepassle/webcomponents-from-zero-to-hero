# Web components: from zero to hero, part two
## _Supercharging web components_

If you've followed along with [part one](https://github.com/thepassle/webcomponents-from-zero-to-hero) of this blog series, you'll know the basics of web components by now. If you haven't, I suggest you go back to part one and catch up, because we'll be supercharging the to-do app we made in part one.

- Explain raw web components and the difference of frameworks versus web components/libraries.

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

