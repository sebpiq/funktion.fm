<div class="container">
  <div class="title">Using Web Audio API in production</div>
  <div class="date">posted the 23/02/2017</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Using Web Audio API in production ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p><a href="https://webaudio.github.io/web-audio-api/">Web Audio API</a> allows to synthesize sound in the web browser with JavaScript. However, as with anything on the web, it can be very challenging to write code that works on all browsers, mobile and desktop. Web Audio API is no exception and here is a little checklist of things to know ...</p>
<h1 id="normalizing-the-api">Normalizing the API</h1>
<p>Web Audio API is a moving target. As of February 2017, the API, method names, functionalities have changed many times and are still not stable. Also, on webkit, the <code>AudioContext</code> object, entry point to Web Audio API, is still prefixed and called <code>webkitAudioContext</code>. A simple way to normalize all the names is to use Chris Wilson&#39;s <a href="https://github.com/cwilso/AudioContext-MonkeyPatch">AudioContext-MonkeyPatch</a>. It is a small script that monkey-patches the functions of Web Audio API in the calling browser and makes sure that names comply with the latest version of the specification, so you don&#39;t need to think about that when writing your code.</p>
<h1 id="audio-formats-supported">Audio formats supported</h1>
<p>If you want to use the Web Audio API, chance is you will want to load some sound files. Problem is, different browsers on different platforms support different audio formats. However if you encode your sound in both <strong>mp3</strong> and <strong>ogg</strong> (and <strong>wav</strong> as a nearly universal fallback), you can cover all the browsers supporting Web Audio API. Firefox supports ogg but not always mp3 (depending on the codecs installed on the user&#39;s system), Safari mp3 but not ogg, Chrome supports all, etc ... Your app must therefore load a different file depending on what formats the current browser supports. For that, I recommend to use <a href="https://github.com/sebpiq/web-audio-boilerplate">web-audio-boilerplate</a>, a small library I wrote :</p>
<pre><code class="lang-html"><div class="highlight"><pre><span class="cp">&lt;!DOCTYPE html&gt;</span>
<span class="nt">&lt;html&gt;</span>
<span class="nt">&lt;head&gt;</span>
  <span class="nt">&lt;script </span><span class="na">type=</span><span class="s">&quot;text/javascript&quot;</span> <span class="na">src=</span><span class="s">&quot;https://sebpiq.github.io/web-audio-boilerplate/dist/web-audio-boilerplate-min.js&quot;</span><span class="nt">&gt;&lt;/script&gt;</span>
  <span class="nt">&lt;script </span><span class="na">type=</span><span class="s">&quot;text/javascript&quot;</span><span class="nt">&gt;</span>
    <span class="nx">webAudioBoilerplate</span><span class="p">.</span><span class="nx">getSupportedFormats</span><span class="p">(</span><span class="k">new</span> <span class="nx">AudioContext</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">err</span><span class="p">,</span> <span class="nx">formats</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">if</span> <span class="p">(</span><span class="nx">formats</span><span class="p">.</span><span class="nx">ogg</span><span class="p">)</span>
        <span class="nx">loadOggFile</span><span class="p">()</span>
      <span class="k">else</span> <span class="k">if</span> <span class="p">(</span><span class="nx">formats</span><span class="p">.</span><span class="nx">mp3</span><span class="p">)</span>
        <span class="nx">loadMp3File</span><span class="p">()</span>
      <span class="k">else</span> <span class="k">if</span> <span class="p">(</span><span class="nx">formats</span><span class="p">.</span><span class="nx">wav</span><span class="p">)</span>
        <span class="nx">loadWavFile</span><span class="p">()</span>
      <span class="k">else</span>
        <span class="nx">console</span><span class="p">.</span><span class="nx">error</span><span class="p">(</span><span class="s1">&#39;no format is supported&#39;</span><span class="p">)</span>
    <span class="p">})</span>
  <span class="nt">&lt;/script&gt;</span>
<span class="nt">&lt;/head&gt;</span>
<span class="nt">&lt;/html&gt;</span>
</pre></div>

</code></pre>
<p><strong>note</strong> : note that for convenience, the built version of <strong>web-audio-boilerplate</strong> also includes the <strong>AudioContextMonkeyPatch.js</strong> mentioned above ...</p>
<p><strong>note2</strong> : you can also encode to other formats tested by <strong>web-audio-boilerplate</strong>. However, be careful as some encoders (mp3, aac, ...) sometimes add silence at the beginning or end of the file, which will cause a glitch when looping your audio.</p>
<h1 id="ios-sounds-need-to-be-triggered-from-an-explicit-user-action-">iOS &quot;sounds need to be triggered from an explicit user action&quot; </h1>
<p>On iOS, <code>AudioContext</code> instances are <a href="https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html">created muted</a>. The only place you can unmute an instance of <code>AudioContext</code> and make sound with Web Audio API is in the callback of a user action. This means that on iOS, your audio application must have some sort of &quot;start&quot; button. Before <strong>iOS 8</strong>, listening to <code>click</code> on that button would work, but with <strong>iOS 9</strong> and later, we need to listen for a <code>touch</code> event. So, if you create your <code>AudioContext</code> directly in the handler of a <code>touch</code> event everything will work fine. Again, you can use <a href="https://github.com/sebpiq/web-audio-boilerplate">web-audio-boilerplate</a> for a cross-browser start button for your web audio app :</p>
<pre><code class="lang-html"><div class="highlight"><pre><span class="cp">&lt;!DOCTYPE html&gt;</span>
<span class="nt">&lt;html&gt;</span>
<span class="nt">&lt;head&gt;</span>
  <span class="nt">&lt;script </span><span class="na">type=</span><span class="s">&quot;text/javascript&quot;</span> <span class="na">src=</span><span class="s">&quot;https://sebpiq.github.io/web-audio-boilerplate/dist/web-audio-boilerplate-min.js&quot;</span><span class="nt">&gt;&lt;/script&gt;</span>
<span class="nt">&lt;/head&gt;</span>
<span class="nt">&lt;body&gt;</span>
  <span class="nt">&lt;button</span> <span class="na">id=</span><span class="s">&quot;startButton&quot;</span><span class="nt">&gt;</span>START<span class="nt">&lt;/button&gt;</span>
  <span class="nt">&lt;script </span><span class="na">type=</span><span class="s">&quot;text/javascript&quot;</span><span class="nt">&gt;</span>
    <span class="kd">var</span> <span class="nx">startButton</span> <span class="o">=</span> <span class="nb">document</span><span class="p">.</span><span class="nx">getElementById</span><span class="p">(</span><span class="s1">&#39;startButton&#39;</span><span class="p">)</span>
    <span class="nx">webAudioBoilerplate</span><span class="p">.</span><span class="nx">getAudioContextOnClick</span><span class="p">(</span><span class="nx">startButton</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">err</span><span class="p">,</span> <span class="nx">audioContext</span><span class="p">)</span> <span class="p">{</span>
      <span class="c1">// `audioContext` is an instance of `AudioContext` that is unmuted!</span>
      <span class="nx">playSoundWith</span><span class="p">(</span><span class="nx">audioContext</span><span class="p">)</span>
    <span class="p">})</span>
  <span class="nt">&lt;/script&gt;</span>
<span class="nt">&lt;/body&gt;</span>
<span class="nt">&lt;/html&gt;</span>
</pre></div>

</code></pre>
<p><strong>note</strong> : if you implement this technique yourself form scratch, be careful of creating your AudioContext <strong>directly</strong> in the event handler, and not in a callback within that event handler ... </p>
<p><strong>note2</strong> : There are other methods fo unmuting audio on iOS. They all require a &quot;start&quot; button. For example creating a silent node to kickstart a previously created AudioContext, etc ... but the method describe above is the simplest in my opinion.</p>
<h1 id="a-cross-browser-sound-player">A cross-browser sound player</h1>
<p>To summarize all of this, here is a full, working, <a href="/audio/web-audio-in-production/looper.html">cross-browser app that just loops a sound</a>.</p>
<h1 id="debugging-tips">Debugging tips</h1>
<p>A couple of silly errors that I have made countless times :</p>
<ul>
<li>If testing on iOS and you have no sound ... check that your <strong>mute switch</strong> is off!</li>
<li>On any device ... also check that your volume is not at zero!</li>
</ul>
<h1 id="despite-all-this-">Despite all this ...</h1>
<p>You <strong>WILL</strong> suffer developping with Web Audio API. There are a lot of inconsistencies between browsers. Functionalities not being implemented, etc ... Also, Web Audio API not being a priority, some bugs that are introduced take ages to be fixed. For example <a href="https://bugs.chromium.org/p/chromium/issues/detail?id=647974">Chrome introduced a bad Web Audio bug</a> in version 53 and it was not fixed before version 57. It broke my production code and caused me to pull my hair off for several months.</p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/web-audio-in-production';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/web-audio-in-production'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
