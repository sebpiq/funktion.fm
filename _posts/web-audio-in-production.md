{{{
  "title" : "Using Web Audio API in production",
  "tags" : [ "web audio api" ],
  "category": "rhizome",
  "date" : "02-23-2017"
}}}

[Web Audio API](https://webaudio.github.io/web-audio-api/) allows to synthesize sound in the web browser with JavaScript. However, as with anything on the web, it can be very challenging to write code that works on all browsers, mobile and desktop. Web Audio API is no exception and here is a little checklist of things to know ...


Normalizing the API
=====================

Web Audio API is a moving target. As of February 2017, the API, method names, functionalities have changed many times and are still not stable. Also, on webkit, the `AudioContext` object, entry point to Web Audio API, is still prefixed and called `webkitAudioContext`. A simple way to normalize all the names is to use Chris Wilson's [AudioContext-MonkeyPatch](https://github.com/cwilso/AudioContext-MonkeyPatch). It is a small script that monkey-patches the functions of Web Audio API in the calling browser and makes sure that names comply with the latest version of the specification, so you don't need to think about that when writing your code.


Audio formats supported
========================

If you want to use the Web Audio API, chance is you will want to load some sound files. Problem is, different browsers on different platforms support different audio formats. However if you encode your sound in both **mp3** and **ogg** (and **wav** as a nearly universal fallback), you can cover all the browsers supporting Web Audio API. Firefox supports ogg but not always mp3 (depending on the codecs installed on the user's system), Safari mp3 but not ogg, Chrome supports all, etc ... Your app must therefore load a different file depending on what formats the current browser supports. For that, I recommend to use [web-audio-boilerplate](https://github.com/sebpiq/web-audio-boilerplate), a small library I wrote :

```html
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="https://sebpiq.github.io/web-audio-boilerplate/dist/web-audio-boilerplate-min.js"></script>
  <script type="text/javascript">
    webAudioBoilerplate.getSupportedFormats(new AudioContext, function(err, formats) {
      if (formats.ogg)
        loadOggFile()
      else if (formats.mp3)
        loadMp3File()
      else if (formats.wav)
        loadWavFile()
      else
        console.error('no format is supported')
    })
  </script>
</head>
</html>
```

**note** : note that for convenience, the built version of **web-audio-boilerplate** also includes the **AudioContextMonkeyPatch.js** mentioned above ...

**note2** : you can also encode to other formats tested by **web-audio-boilerplate**. However, be careful as some encoders (mp3, aac, ...) sometimes add silence at the beginning or end of the file, which will cause a glitch when looping your audio.


iOS "sounds need to be triggered from an explicit user action" 
================================================================

On iOS, `AudioContext` instances are [created muted](https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html). The only place you can unmute an instance of `AudioContext` and make sound with Web Audio API is in the callback of a user action. This means that on iOS, your audio application must have some sort of "start" button. Before **iOS 8**, listening to `click` on that button would work, but with **iOS 9** and later, we need to listen for a `touch` event. So, if you create your `AudioContext` directly in the handler of a `touch` event everything will work fine. Again, you can use [web-audio-boilerplate](https://github.com/sebpiq/web-audio-boilerplate) for a cross-browser start button for your web audio app :

```html
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="https://sebpiq.github.io/web-audio-boilerplate/dist/web-audio-boilerplate-min.js"></script>
</head>
<body>
  <button id="startButton">START</button>
  <script type="text/javascript">
    var startButton = document.getElementById('startButton')
    webAudioBoilerplate.getAudioContextOnClick(startButton, function(err, audioContext) {
      // `audioContext` is an instance of `AudioContext` that is unmuted!
      playSoundWith(audioContext)
    })
  </script>
</body>
</html>
```

**note** : if you implement this technique yourself form scratch, be careful of creating your AudioContext **directly** in the event handler, and not in a callback within that event handler ... 

**note2** : There are other methods fo unmuting audio on iOS. They all require a "start" button. For example creating a silent node to kickstart a previously created AudioContext, etc ... but the method describe above is the simplest in my opinion.

A cross-browser sound player
==============================

To summarize all of this, here is a full, working, [cross-browser app that just loops a sound](/web-audio-api-in-production.html).


Debugging tips
===================

A couple of silly errors that I have made countless times :

- If testing on iOS and you have no sound ... check that your **mute switch** is off!
- On any device ... also check that your volume is not at zero!


Despite all this ...
========================

You **WILL** suffer developping with Web Audio API. There are a lot of inconsistencies between browsers. Functionalities not being implemented, etc ... Also, Web Audio API not being a priority, some bugs that are introduced take ages to be fixed. For example [Chrome introduced a bad Web Audio bug](https://bugs.chromium.org/p/chromium/issues/detail?id=647974) in version 53 and it was not fixed before version 57. It broke my production code and caused me to pull my hair off for several months.


