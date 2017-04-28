<div class="container">
  <div class="title">WebPd refactor, status update</div>
  <div class="date">posted the 12/10/2013</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=WebPd refactor, status update ' + encodeURIComponent(location.href) + ' via @sebpiq',
          'twitter-share-dialog',
          'width=626,height=436');
        return false;">
      <img src="/images/twitter-blue.svg">
    </a>

    <a class="facebook" href="" 
      onclick="
        window.open(
          'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href), 
          'facebook-share-dialog',
          'width=626,height=436'); 
        return false;">
      <img src="/images/facebook-blue.svg">
    </a>

  </div>

  <div class="content"><p><a href="https://github.com/sebpiq/WebPd">WebPd</a> as a proof-of-concept has worked quite well so far. It&#39;s about time to think about a better, faster, more durable architecture for the library. And so, I started refactoring WebPd last spring.</p>
<p>As <a href="https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html">Web Audio API</a> is becoming a standard, it then offered two options for this refactoring :</p>
<ol>
<li>Each WebPd object implemented as a Web Audio API node (<strong>the option I chose at the time</strong>)</li>
<li>All the dsp written in JavaScript, and running into a single <em>ScriptProcessorNode</em> (what was done in the old version of WebPd)</li>
</ol>
<h3 id="in-theory-it-all-worked-nicely-">In theory it all worked nicely ...</h3>
<p>Since both Web Audio API and Pure Data use a <a href="http://en.wikipedia.org/wiki/Dataflow_programming">dataflow</a> paradigm, I had in mind to try mapping Pure Data objects to Web Audio API nodes. For example Pd&#39;s <em>[osc~]</em> maps to Web Audio API&#39;s <em>Oscillator</em>, Pd&#39;s <em>[delread~]</em> and <em>[delwrite~]</em> to Web Audio API&#39;s <em>DelayNode</em>, and so on ... The Pd objects which don&#39;t have an equivalent in Web Audio API, would have been implemented in JavaScript using Web Audio API&#39;s <em>ScriptProcessorNode</em>.</p>
<h3 id="-but-then-back-to-reality">... but, then back to reality</h3>
<p>The journey was painful. I banged my head trying to find workarounds for many shortcomings of the Web Audio API. In particular, it&#39;s timing mechanism (or rather the absence of a proper timing mechanism), which led to the development of <a href="https://github.com/sebpiq/WAAClock">WAAClock</a>, an experimental, hackish, little timing framework for Web Audio API.</p>
<p>But what really set me off, is when I realized that <em>ScriptProcessorNode</em> - which I hoped could be used to implement all the missing nodes - is practically useless.</p>
<p>The only advantage in <em>option 1</em> is that native nodes run faster and with a lower latency than dsp functions written in JavaScript (i.e. <em>option 2</em>). But that advantage is lost as soon as you start using some <em>ScriptProcessorNodes</em> somewhere in the dsp graph, which in our case cannot be avoided.</p>
<p>Therefore, I have decided to go back to the good old method of writing all the dsp in JavaScript, as this is currently the only sane way of doing things.</p>
<h3 id="good-things-that-came-out-of-all-this">Good things that came out of all this</h3>
<p>Fortunately, the refactor has been far from useless. The different components in the new <em>WebPd</em> are more loosely coupled, and therefore the whole library is much cleaner.</p>
<p>The <em>Pd</em> file parsing module has been taken out into a separate node.js library called <a href="https://github.com/sebpiq/pd-fileutils">pd-fileutils</a>, hoping that it could be useful for other purposes. For example, it can be used to generate patches from scratch, as done with this <a href="http://sebpiq.github.io/pd-fileutils/randomDrone.html">random drone generator</a>, or to <a href="http://sebpiq.github.io/pd-fileutils/onlineSvgRenderer.html">render patches online</a> to SVG format.</p>
<p>Support for <em>subpatches</em> and <em>abstractions</em>, has been added, as well as partial support for controls (bangs, toggles, ...).</p>
<p>And last, but not the least, <em>WebPd</em> is now completely decoupled from the dsp engine. This means that in the future, if Web Audio API becomes better, it will be very easy to start using it.</p>
<p>And yeah ... now basically most of the work is done, and now it&#39;s coming for real and very soon!!! So stay tuned!</p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/webpd-refactor';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/webpd-refactor'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
  };
  
  (function() { // DON'T EDIT BELOW THIS LINE
  var d = document, s = d.createElement('script');
  s.src = '//funktion-fm.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
  })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>

</div>
