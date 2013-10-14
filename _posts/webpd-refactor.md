{{{
  "title" : "WebPd refactor to web audio API will be over soon",
  "tags" : [ "WebPd" ],
  "date" : "10-12-2013"
}}}

I have been pretty busy this summer, but the development of [WebPd](https://github.com/sebpiq/WebPd) will resume next week!

I can't wait to continue the refactor I have started already a while ago, porting **WebPd** to [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html). The old version which is currently in the master branch of the repository basically uses a custom DSP function, so I hope it can be cleaner and more performant by using Web Audio API instead.

This is also the reason why I have been bad at maintaining the library so far, simply because I knew I would have to rewrite it from scratch.

The refactor is now well under-way, and I worked out some really annoying issues with Web Audio API. For example, implementing a flexible timing system is quite icky, so I wrote [WAAClock](https://github.com/sebpiq/WAAClock) to serve as a timing engine for **WebPd**.

I also took out the **Pd** file parsing module into a node.js library called [pd-fileutils](https://github.com/sebpiq/pd-fileutils), hoping that it could be useful for other purposes. For example, it can be used to generate patches from scratch, as done with this [random drone generator](http://sebpiq.github.io/pd-fileutils/randomDrone.html), or to [render patches online](http://sebpiq.github.io/pd-fileutils/onlineSvgRenderer.html) to SVG format.

The new version of **WebPd** will even support things that the old didn't. For example *subpatches* and *abstractions*, or partial support for controls (bangs, toggles, ...) which before would cause **WebPd** to throw an error.

So yeah ... basically most of the work is done, and now it's coming for real and very soon!!! Stay tuned!
