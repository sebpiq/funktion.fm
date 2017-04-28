<div class="container">
  <div class="title">Present and future of WebPd</div>
  <div class="date">posted the 07/09/2015</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Present and future of WebPd ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p>Over the past few months, I have received a lot of emails, questions, comments about <a href="https://github.com/sebpiq/WebPd">WebPd</a>. So here is a little post to recap it all ... WebPd&#39;s present, WebPd&#39;s future, challenges and utopia of Pd and sound programming on the web.</p>
<!--more-->
<h1 id="present">Present</h1>
<p>In order to understand were this is all heading, one must first know about the technology which makes WebPd possible : the <a href="http://webaudio.github.io/web-audio-api/">Web Audio API</a>.</p>
<h2 id="what-is-waa-">What is WAA ?</h2>
<p>The <strong>Web Audio API</strong> is an open specification, already implemented by several browser vendors (Firefox, Chrome, Safari, Microsoft Edge is coming) and whose stated aim is to provide </p>
<blockquote>
<p>&quot;a high-level JavaScript API for processing and synthesizing audio in web applications. The primary paradigm is of an audio routing graph, where a number of AudioNode objects are connected together to define the overall audio rendering. The actual processing will primarily take place in the underlying implementation (typically optimized Assembly / C / C++ code), but direct JavaScript processing and synthesis is also supported.&quot;</p>
</blockquote>
<p>So basically a set of nodes to be connected together in a DSP graph ... very similar to Pure Data, only using text-programming. An Example :</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">audioContext</span> <span class="o">=</span> <span class="k">new</span> <span class="nx">AudioContext</span><span class="p">();</span>
<span class="kd">var</span> <span class="nx">osc</span> <span class="o">=</span> <span class="nx">audioContext</span><span class="p">.</span><span class="nx">createOscillator</span><span class="p">();</span>
<span class="nx">osc</span><span class="p">.</span><span class="nx">connect</span><span class="p">(</span><span class="nx">audioContext</span><span class="p">.</span><span class="nx">destination</span><span class="p">);</span>
<span class="nx">osc</span><span class="p">.</span><span class="nx">frequency</span><span class="p">.</span><span class="nx">value</span> <span class="o">=</span> <span class="mi">220</span><span class="p">;</span>
<span class="nx">osc</span><span class="p">.</span><span class="nx">start</span><span class="p">(</span><span class="mi">0</span><span class="p">);</span>
</pre></div>

</code></pre>
<p>And it works well, though as of today is still very much <a href="http://www.w3.org/2011/audio/">a work in progress</a>.</p>
<h2 id="two-competing-approaches-for-audio-processing">Two competing approaches for audio processing</h2>
<p>Web Audio API provides two ways to generate and process audio, which can inter-operate.</p>
<ol>
<li><p>a limited set of native audio nodes : oscillators, delays, etc.. which are implemented in C++ and are thus very performant.</p>
</li>
<li><p>a special node called the <code>ScriptProcessorNode</code>, which allows you to run custom DSP written in JavaScript, and can be connected with native audio nodes in the same graph.</p>
</li>
</ol>
<p>The native audio nodes, though they are fast, provide only a very limited set of functionalities, not enough to re-implement Pure Data.</p>
<p>The <code>ScriptProcessorNode</code> sounds very exciting at first, because it allows in theory to implement pretty much anything. However, it has huge performance issues, mostly because it runs in the main thread of the web page, and therefore shares resources with layout, user events, and pretty much everything else on your web page ... which is obviously very bad for real-time audio. There is an up-coming replacement for <code>ScriptProcessorNode</code> which is called <code>AudioWorker</code>, and should fix some of <code>ScriptProcessorNode</code>&#39;s issues, but it won&#39;t land in major browsers before at least another 6 months.</p>
<p>So today, with these two options, <strong>Web Audio API presents the dilemna of having to choose between performance and flexibility</strong>. </p>
<h2 id="how-is-webpd-using-the-web-audio-api-">How is WebPd using the web audio API?</h2>
<p>With WebPd I have hesitated for a long time between these two solutions, and though the inital version was all custom DSP running in a single <code>ScriptProcessorNode</code>, I decided last autumn to go for performance and see how much of the Pure Data functionality I could implement with only native nodes. Unfortunately, the answer is <em>&quot;not much&quot;</em> as the <a href="https://github.com/sebpiq/WebPd/blob/5cee4dce15f1e2d2388311145fbb09ccaaa0f780/OBJECTLIST.md">list of objects</a> from the current version shows. In fact, I came to the conclusion that native audio nodes are just not going to cut it. </p>
<p><em>Chris Mc Cormick, the original creator of WebPd answered to my original post by saying :</em></p>
<blockquote>
<p>one feature that was important to me was to have WebPd work as a system where you could take an existing Pd patch and be pretty sure it would sound and work the same</p>
</blockquote>
<p>And it is true that this is a problem which many people have encountered. Not only are many objects not implemented, but some of WebPd dsp objects have different behaviour than their Pd counterparts (e.g. filters and oscillators). Obviously this is bad ... and this is one strong argument against using native audio nodes and in favor of custom dsp.</p>
<p>However, what pushed me towards native nodes at the time, is that you couldn&#39;t really use WebPd on mobile devices with custom dsp. <code>ScriptProcessorNode</code> would immediately choke, and make the whole thing pretty much unusable. So this was a choice between on one hand purity and compliance with Pd, on the other hand usability and being able to run on any device. I chose pragmatism over purity (and was <a href="https://github.com/WebAudio/web-audio-api/issues/263">totally gutted about Web Audio API</a>).</p>
<h1 id="near-future-webpd-0-4-0-">Near future (WebPd 0.4.0)</h1>
<p>There is now two alternatives. The first is to re-implement the whole thing with custom DSP, and forget about native nodes ; the second, to go for a mixed solution. However, in order to choose, we need to wait for the <code>AudioWorker</code> to be finalized and implemented in all major browsers, then do some benchmarks and finally make an educated guess.</p>
<p>So, as the future of Web Audio API is so uncertain, and in order to move forward, the goal for next release of WebPd is to make the library completely <strong>dsp-agnostic</strong>. WebPd&#39;s code would contains all the basic high-level functionalities and all the non-dsp objects in a common core. The DSP code could then be provided in several flavors, several distributions of WebPd. One distribution would provide only native audio nodes, so it would be faster but would have a very limited set of dsp objects, another distribution, which would be less performant, could implement custom DSP in a <code>ScriptProcessorNode</code> and aim for providing all the dsp objects Pd vanilla also offers.</p>
<p>Once <a href="https://github.com/sebpiq/WebPd/issues?q=is%3Aopen+is%3Aissue+milestone%3A0.4.0">this major refactor</a> will be done, I&#39;ll be more confident in thinking about the future, implementing many more objects, and more craziness that people have mentioned to me.</p>
<h1 id="further-future">Further future</h1>
<p>So in a slightly more distant future, here are some of the things people have mentioned to me and which I plan to work on (hopefully with help from other developers).  </p>
<h2 id="opening-directly-sound-from-soundcloud-and-other-online-resources">Opening directly sound from SoundCloud and other online resources</h2>
<p>Easy.</p>
<h2 id="a-web-based-pd-gui">A Web-based Pd GUI</h2>
<p>That is the suggestion / comment I have received the most. A GUI for Pure Data based on web technologies could really solve many of the issues of the current Pure Data desktop GUI. It could be more beautiful, more usable, and more maintainable, as there is a growing amount of people comfortable with JavaScript and other web technologies. Such a big developer base could push new features and bug fixes much faster, and enable Pure Data interface to evolve and improve dramatically.</p>
<p>Another exciting aspect is the possibility to have social features, and connectedness in such an interface. People would be able to publish / share / listen / modify their patches online.</p>
<h2 id="a-scripting-layer-for-pure-data">A scripting layer for Pure Data</h2>
<p>Graphical programming is great for dataflow but not so great for control flow. If you have experience with both text-programming and Pure Data, you might have noticed that simple things like maintaing states, branching (if / else), creating and deleting objects programmatically (aka dynamic patching) can be painstakingly hard in Pd, while they are trivial things in most programming languages.</p>
<p>WebPd being built in JavaScript, it is possible to take the best of both worlds : writing dataflow in Pd and script dynamic behaviours with JavaScript. In fact WebPd already allows this! However the API will most likely change in the future, so I won&#39;t make it public before it becomes more stable. At this point, I&#39;ll publish a full documentation and examples showing how powerful a paradigm this is! </p>
<h2 id="better-compliance-with-pd">Better compliance with Pd</h2>
<p>The possibility of having different implementations of WebPd, in particular one that uses a custom dsp engine, means that it will be possible to have a distribution of WebPd that tries to comply as much as possible with Pd.</p>
<p>Hopefully with the arrival of the <code>AudioWorker</code>, custom dsp could become so efficient that such a distribution of WebPd could also be a viable cross-browser and cross-platform option. But without an <code>AudioWorker</code> implementation to do some testing, there&#39;s no way to know ...</p>
<h1 id="so-yes-there-is-still-a-lot-to-do">So yes, there is still a lot to do</h1>
<p> ... but I think that all these things will happen quite soon. In fact they are already possible today, but they take a lot of time to implement. Meanwhile, please keep faith, be patient and bear with the current quirks and limitations of WebPd, and when the next version will be out, I&#39;ll feel more comfortable about gathering a small developer base to help in developing this faster and further.</p>
<p>Also, please continue to send comments and questions, either on the pd mailing list, or on the WebPd github page, or directly to me, by email.</p>
<p><a href="https://twitter.com/sebpiq/status/640887792470499328">comment on this post</a></p>
<p><strong>EDIT 08/09/2015</strong> : added answer to Chris + added the section <em>better compliance with Pd</em></p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/webpd-future';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/webpd-future'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
