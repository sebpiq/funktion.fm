{{{
  "title" : "Versificator",
  "url": "/projects/versificator",
  "imgUrl": ""
}}}

Experiments on automatically recycling the overwhelming amount of recorded music available.


1 ---
=======

A simple "instrument" that allows you to fetch any track from soundcloud and turn it into a drone by using paulstretch and bit of amplitude modulation and filtering.

Demo > [HERE](http://sebpiq.github.io/paulstretch.js/examples/stretched-and-droned/dist/index.html)


2 ---
======

Sketches on generating tracks with different algorithms to recycle SoundCloud sound tracks.
            
<audio controls="">
  <source data-src="/audio/versificator/sketch1.mp3" src="" type="audio/mpeg" />
  <source data-src="/audio/versificator/sketch1.ogg" src="" type="audio/ogg" />
  <em>Sorry, your browser doesn't support HTML5 audio.</em>
</audio>
<audio controls="">
  <source data-src="/audio/versificator/sketch2.mp3" src="" type="audio/mpeg" />
  <source data-src="/audio/versificator/sketch2.ogg" src="" type="audio/ogg" />
  <em>Sorry, your browser doesn't support HTML5 audio.</em>
</audio>


3 ---
=======

This is a stream generated continuously from bits of tracks downloaded from SoundCloud. Press play to start listening.
  This generates mostly random rubish, but it is really just a prototype to test out different technologies.

**note** : only ogg stream is available at the moment, so it won't work in Internet Explorer, and might not work in Safari.

<audio controls="">
  <!--<source src="http://versificator.fm:8000/main" type="audio/mpeg" />-->
  <source data-src="http://versificator.fm:8000/main" type="audio/ogg" />
  <em>Sorry, your browser doesn't support HTML5 audio.</em>
</audio>


More links
===========

- [Python library to process audio](https://github.com/sebpiq/pychedelic)
- [JS implementation of paulstretch](https://github.com/sebpiq/paulstretch.js)