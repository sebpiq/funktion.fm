{{{
  "title" : "Present and future of WebPd",
  "tags" : [ "WebPd", "programming", "web audio api" ],
  "date" : "07/09/2015"
}}}

Over the past few months, I have received a lot of emails, questions, comments about [WebPd](https://github.com/sebpiq/WebPd). So here is a little post to recap it all ... WebPd's present, WebPd's future, challenges and utopia of Pd and sound programming on the web.

<!--more-->


Present
=============

In order to understand were this is all heading, one must first know about the technology which makes WebPd possible : the [Web Audio API](http://webaudio.github.io/web-audio-api/).

What is WAA ?
-----------------

The **Web Audio API** is an open specification, already implemented by several browser vendors (Firefox, Chrome, Safari, Microsoft Edge is coming) and whose stated aim is to provide 

> "a high-level JavaScript API for processing and synthesizing audio in web applications. The primary paradigm is of an audio routing graph, where a number of AudioNode objects are connected together to define the overall audio rendering. The actual processing will primarily take place in the underlying implementation (typically optimized Assembly / C / C++ code), but direct JavaScript processing and synthesis is also supported."

So basically a set of nodes to be connected together in a DSP graph ... very similar to Pure Data, only using text-programming. An Example :

```javascript
var audioContext = new AudioContext();
var osc = audioContext.createOscillator();
osc.connect(audioContext.destination);
osc.frequency.value = 220;
osc.start(0);
```

And it works well, though as of today is still very much [a work in progress](http://www.w3.org/2011/audio/).


Two competing approaches for audio processing
-----------------------------------------------

Web Audio API provides two ways to generate and process audio, which can inter-operate.

1. a limited set of native audio nodes : oscillators, delays, etc.. which are implemented in C++ and are thus very performant.

2. a special node called the `ScriptProcessorNode`, which allows you to run custom DSP written in JavaScript, and can be connected with native audio nodes in the same graph.

The native audio nodes, though they are fast, provide only a very limited set of functionalities, not enough to re-implement Pure Data.

The `ScriptProcessorNode` sounds very exciting at first, because it allows in theory to implement pretty much anything. However, it has huge performance issues, mostly because it runs in the main thread of the web page, and therefore shares resources with layout, user events, and pretty much everything else on your web page ... which is obviously very bad for real-time audio. There is an up-coming replacement for `ScriptProcessorNode` which is called `AudioWorker`, and should fix some of `ScriptProcessorNode`'s issues, but it won't land in major browsers before at least another 6 months.

So today, with these two options, **Web Audio API presents the dilemna of having to choose between performance and flexibility**. 


How is WebPd using the web audio API?
--------------------------------------

With WebPd I have hesitated for a long time between these two solutions, and though the inital version was all custom DSP running in a single `ScriptProcessorNode`, I decided last autumn to go for performance and see how much of the Pure Data functionality I could implement with only native nodes. Unfortunately, the answer is *"not much"* as the [list of objects](https://github.com/sebpiq/WebPd/blob/5cee4dce15f1e2d2388311145fbb09ccaaa0f780/OBJECTLIST.md) from the current version shows. In fact, I came to the conclusion that native audio nodes are just not going to cut it. 

*Chris Mc Cormick, the original creator of WebPd answered to my original post by saying :*

> one feature that was important to me was to have WebPd work as a system where you could take an existing Pd patch and be pretty sure it would sound and work the same

And it is true that this is a problem which many people have encountered. Not only are many objects not implemented, but some of WebPd dsp objects have different behaviour than their Pd counterparts (e.g. filters and oscillators). Obviously this is bad ... and this is one strong argument against using native audio nodes and in favor of custom dsp.

However, what pushed me towards native nodes at the time, is that you couldn't really use WebPd on mobile devices with custom dsp. `ScriptProcessorNode` would immediately choke, and make the whole thing pretty much unusable. So this was a choice between on one hand purity and compliance with Pd, on the other hand usability and being able to run on any device. I chose pragmatism over purity (and was [totally gutted about Web Audio API](https://github.com/WebAudio/web-audio-api/issues/263)).


Near future (WebPd 0.4.0)
==========================

There is now two alternatives. The first is to re-implement the whole thing with custom DSP, and forget about native nodes ; the second, to go for a mixed solution. However, in order to choose, we need to wait for the `AudioWorker` to be finalized and implemented in all major browsers, then do some benchmarks and finally make an educated guess.

So, as the future of Web Audio API is so uncertain, and in order to move forward, the goal for next release of WebPd is to make the library completely **dsp-agnostic**. WebPd's code would contains all the basic high-level functionalities and all the non-dsp objects in a common core. The DSP code could then be provided in several flavors, several distributions of WebPd. One distribution would provide only native audio nodes, so it would be faster but would have a very limited set of dsp objects, another distribution, which would be less performant, could implement custom DSP in a `ScriptProcessorNode` and aim for providing all the dsp objects Pd vanilla also offers.

Once [this major refactor](https://github.com/sebpiq/WebPd/issues?q=is%3Aopen+is%3Aissue+milestone%3A0.4.0) will be done, I'll be more confident in thinking about the future, implementing many more objects, and more craziness that people have mentioned to me.


Further future
=================

So in a slightly more distant future, here are some of the things people have mentioned to me and which I plan to work on (hopefully with help from other developers).  


Opening directly sound from SoundCloud and other online resources
-------------------------------------------------------------------

Easy.


A Web-based Pd GUI
--------------------

That is the suggestion / comment I have received the most. A GUI for Pure Data based on web technologies could really solve many of the issues of the current Pure Data desktop GUI. It could be more beautiful, more usable, and more maintainable, as there is a growing amount of people comfortable with JavaScript and other web technologies. Such a big developer base could push new features and bug fixes much faster, and enable Pure Data interface to evolve and improve dramatically.

Another exciting aspect is the possibility to have social features, and connectedness in such an interface. People would be able to publish / share / listen / modify their patches online.


A scripting layer for Pure Data
--------------------------------

Graphical programming is great for dataflow but not so great for control flow. If you have experience with both text-programming and Pure Data, you might have noticed that simple things like maintaing states, branching (if / else), creating and deleting objects programmatically (aka dynamic patching) can be painstakingly hard in Pd, while they are trivial things in most programming languages.

WebPd being built in JavaScript, it is possible to take the best of both worlds : writing dataflow in Pd and script dynamic behaviours with JavaScript. In fact WebPd already allows this! However the API will most likely change in the future, so I won't make it public before it becomes more stable. At this point, I'll publish a full documentation and examples showing how powerful a paradigm this is! 


Better compliance with Pd
-------------------------

The possibility of having different implementations of WebPd, in particular one that uses a custom dsp engine, means that it will be possible to have a distribution of WebPd that tries to comply as much as possible with Pd.

Hopefully with the arrival of the `AudioWorker`, custom dsp could become so efficient that such a distribution of WebPd could also be a viable cross-browser and cross-platform option. But without an `AudioWorker` implementation to do some testing, there's no way to know ...


So yes, there is still a lot to do
====================================

 ... but I think that all these things will happen quite soon. In fact they are already possible today, but they take a lot of time to implement. Meanwhile, please keep faith, be patient and bear with the current quirks and limitations of WebPd, and when the next version will be out, I'll feel more comfortable about gathering a small developer base to help in developing this faster and further.

Also, please continue to send comments and questions, either on the pd mailing list, or on the WebPd github page, or directly to me, by email.

[comment on this post](https://twitter.com/sebpiq/status/640887792470499328)

**EDIT 08/09/2015** : added answer to Chris + added the section *better compliance with Pd*