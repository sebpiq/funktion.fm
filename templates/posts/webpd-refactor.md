{{{
  "title" : "WebPd refactor, status update",
  "tags" : ["project"],
  "project": "webpd",
  "date" : "12/10/2013"
}}}

[WebPd](https://github.com/sebpiq/WebPd) as a proof-of-concept has worked quite well so far. It's about time to think about a better, faster, more durable architecture for the library. And so, I started refactoring WebPd last spring.

As [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html) is becoming a standard, it then offered two options for this refactoring :

1. Each WebPd object implemented as a Web Audio API node (**the option I chose at the time**)
2. All the dsp written in JavaScript, and running into a single *ScriptProcessorNode* (what was done in the old version of WebPd)

### In theory it all worked nicely ...

Since both Web Audio API and Pure Data use a [dataflow](http://en.wikipedia.org/wiki/Dataflow_programming) paradigm, I had in mind to try mapping Pure Data objects to Web Audio API nodes. For example Pd's *[osc~]* maps to Web Audio API's *Oscillator*, Pd's *[delread~]* and *[delwrite~]* to Web Audio API's *DelayNode*, and so on ... The Pd objects which don't have an equivalent in Web Audio API, would have been implemented in JavaScript using Web Audio API's *ScriptProcessorNode*.

### ... but, then back to reality

The journey was painful. I banged my head trying to find workarounds for many shortcomings of the Web Audio API. In particular, it's timing mechanism (or rather the absence of a proper timing mechanism), which led to the development of [WAAClock](https://github.com/sebpiq/WAAClock), an experimental, hackish, little timing framework for Web Audio API.

But what really set me off, is when I realized that *ScriptProcessorNode* - which I hoped could be used to implement all the missing nodes - is practically useless.

The only advantage in *option 1* is that native nodes run faster and with a lower latency than dsp functions written in JavaScript (i.e. *option 2*). But that advantage is lost as soon as you start using some *ScriptProcessorNodes* somewhere in the dsp graph, which in our case cannot be avoided.

Therefore, I have decided to go back to the good old method of writing all the dsp in JavaScript, as this is currently the only sane way of doing things.

### Good things that came out of all this

Fortunately, the refactor has been far from useless. The different components in the new *WebPd* are more loosely coupled, and therefore the whole library is much cleaner.

The *Pd* file parsing module has been taken out into a separate node.js library called [pd-fileutils](https://github.com/sebpiq/pd-fileutils), hoping that it could be useful for other purposes. For example, it can be used to generate patches from scratch, as done with this [random drone generator](http://sebpiq.github.io/pd-fileutils/randomDrone.html), or to [render patches online](http://sebpiq.github.io/pd-fileutils/onlineSvgRenderer.html) to SVG format.

Support for *subpatches* and *abstractions*, has been added, as well as partial support for controls (bangs, toggles, ...).

And last, but not the least, *WebPd* is now completely decoupled from the dsp engine. This means that in the future, if Web Audio API becomes better, it will be very easy to start using it.

And yeah ... now basically most of the work is done, and now it's coming for real and very soon!!! So stay tuned!
