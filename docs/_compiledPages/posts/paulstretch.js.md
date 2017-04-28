<div class="container">
  <div class="title">Paulstretch algorithm with Web Audio API, and how to delegate audio processing to web workers</div>
  <div class="date">posted the 17/11/2014</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Paulstretch algorithm with Web Audio API, and how to delegate audio processing to web workers ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p>Just published an implementation of PaulStretch in JavaScript which I made about a year ago. The <a href="https://github.com/sebpiq/paulstretch.js">repository is here</a> and in addition there is a demo <a href="http://sebpiq.github.io/paulstretch.js/examples/stretched-and-droned/dist/index.html">which allows you to create nice drones from SoundCloud tracks</a>. The following post is a more general tutorial on how to process audio live with web workers, and it uses <strong>paulstretch.js</strong> as an example.</p>
<!--more-->
<p><strong>paulstretch.js</strong> can be used in Node.js and in the browser. Unlike the original PaulStretch implementations, it is designed for allowing the user to change the stretch ratio at any time.</p>
<p>Let&#39;s go over its API, in order to make the following example clearer.</p>
<p>Note that in the following, <code>blockOut</code> and <code>blockIn</code> are just arrays representing channels data. For example a stereo block of 10 frames is represented by <code>[new Float32Array(10), new Float32Array(10)]</code>.</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="c1">// Creates a PaulStretch instance. Typical `winSize` is 4096.</span>
<span class="c1">// The created instance has 2 queues. One &#39;write queue&#39; with raw input frames,</span>
<span class="c1">// one &#39;read queue&#39; with processed frames.</span>
<span class="kd">var</span> <span class="nx">paulstretch</span> <span class="o">=</span> <span class="k">new</span> <span class="nx">PaulStretch</span><span class="p">(</span><span class="nx">numberOfChannels</span><span class="p">,</span> <span class="nx">initialStretchRatio</span><span class="p">,</span> <span class="nx">winSize</span><span class="p">)</span>

<span class="c1">// Writes a block to the &#39;write queue&#39;.</span>
<span class="nx">paulstretch</span><span class="p">.</span><span class="nx">write</span><span class="p">(</span><span class="nx">blockIn</span><span class="p">)</span>

<span class="c1">// Processes the data from the &#39;write queue&#39; and add it to the &#39;read queue&#39;.</span>
<span class="c1">// It also returns the number of frames that were processed.</span>
<span class="c1">// If there is not enough data to process, 0 is returned.</span>
<span class="nx">paulstretch</span><span class="p">.</span><span class="nx">process</span><span class="p">()</span> 

<span class="c1">// Reads the processed data from the &#39;read queue&#39; to `blockOut`.</span>
<span class="c1">// The amount of frames read depends on the length of `blockOut`.</span>
<span class="c1">// If there is not enough frames to fill `blockOut`, `null` is returned.</span>
<span class="nx">paulstretch</span><span class="p">.</span><span class="nx">read</span><span class="p">(</span><span class="nx">blockOut</span><span class="p">)</span>

<span class="c1">// Returns the number of processed frames in the &#39;read queue&#39;.</span>
<span class="nx">paulstretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span>

<span class="c1">// Set the time stretch ratio. Note that frames in the `readQueue` won&#39;t be affected.</span>
<span class="nx">paulstretch</span><span class="p">.</span><span class="nx">setRatio</span><span class="p">(</span><span class="nx">newRatio</span><span class="p">)</span>
</pre></div>

</code></pre>
<h1 id="the-web-audio-api-code">The web audio API code</h1>
<p>As all the processing will happen in a worker, the only thing we want from web audio API is to read incoming blocks of audio and send them for processing to our worker.</p>
<p>So we create a <code>ScriptProcessorNode</code>, with an <code>onaudioprocess</code> method that :</p>
<ol>
<li>reads incoming blocks of audio, writes them to a queue <code>blocksIn</code> which will be sent to the worker.</li>
<li>plays back audio from another queue <code>blocksOut</code> which contains processed audio blocks received from the worker.</li>
</ol>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">blocksIn</span> <span class="o">=</span> <span class="p">[]</span>
  <span class="p">,</span> <span class="nx">blocksOut</span> <span class="o">=</span> <span class="p">[]</span>

<span class="nx">paulstretchNode</span><span class="p">.</span><span class="nx">onaudioprocess</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">event</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">ch</span><span class="p">,</span> <span class="nx">block</span> <span class="o">=</span> <span class="p">[]</span>

  <span class="k">for</span> <span class="p">(</span><span class="nx">ch</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">ch</span> <span class="o">&lt;</span> <span class="nx">numberOfChannels</span><span class="p">;</span> <span class="nx">ch</span><span class="o">++</span><span class="p">)</span>
    <span class="nx">block</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="nx">event</span><span class="p">.</span><span class="nx">inputBuffer</span><span class="p">.</span><span class="nx">getChannelData</span><span class="p">(</span><span class="nx">ch</span><span class="p">))</span>
  <span class="nx">blocksIn</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="nx">block</span><span class="p">)</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksOut</span><span class="p">.</span><span class="nx">length</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">block</span> <span class="o">=</span> <span class="nx">blocksOut</span><span class="p">.</span><span class="nx">shift</span><span class="p">()</span>
    <span class="k">for</span> <span class="p">(</span><span class="nx">ch</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">ch</span> <span class="o">&lt;</span> <span class="nx">numberOfChannels</span><span class="p">;</span> <span class="nx">ch</span><span class="o">++</span><span class="p">)</span>
      <span class="nx">event</span><span class="p">.</span><span class="nx">outputBuffer</span><span class="p">.</span><span class="nx">getChannelData</span><span class="p">(</span><span class="nx">ch</span><span class="p">).</span><span class="nx">set</span><span class="p">(</span><span class="nx">block</span><span class="p">[</span><span class="nx">ch</span><span class="p">])</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>

</code></pre>
<h1 id="the-worker-file">The worker file</h1>
<p>Here is a template of our worker file with a message handler for receiving commands from the main thread.</p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="nx">onmessage</span> <span class="o">=</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">event</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">switch</span> <span class="p">(</span> <span class="nx">event</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">type</span> <span class="p">)</span> <span class="p">{</span>
    <span class="k">case</span> <span class="s1">&#39;read&#39;</span><span class="o">:</span>
      <span class="k">break</span>
    <span class="k">case</span> <span class="s1">&#39;write&#39;</span><span class="o">:</span>
      <span class="k">break</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>

</code></pre>
<p>In order to keep the audio responsive, and be able to change the stretch ratio live, we need to process audio only at the last moment. This will be handled in the <code>&#39;read&#39;</code> case.</p>
<p>Writing is trivial ... we just take the audio as it comes :</p>
<pre><code class="lang-javascript"><div class="highlight"><pre>  <span class="k">case</span> <span class="s1">&#39;write&#39;</span><span class="o">:</span>
    <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">write</span><span class="p">(</span><span class="nx">event</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">data</span><span class="p">)</span>
    <span class="k">break</span>
  <span class="p">}</span>
</pre></div>

</code></pre>
<p>Reading is more tricky. We need to make sure that we have enough processed audio to meet the demand. and not starve the <code>ScriptProcessorNode</code>, which would result in ugly glitches of agony. For this, we will simply buffer the processed audio, making sure that we always have a batch of <code>batchSize</code> blocks ready to be sent. Of course, the bigger the buffer (i.e. the bigger batch size), the less likely you are to get glitches. Unfortunately, the bigger the buffer, the bigger the latency between a change of stretch ratio and an audible result. </p>
<pre><code class="lang-javascript"><div class="highlight"><pre>  <span class="k">case</span> <span class="s1">&#39;read&#39;</span><span class="o">:</span>
    <span class="kd">var</span> <span class="nx">i</span>

    <span class="c1">// If there is at least `batchSize` blocks of audio ready to be sent in the &#39;read queue&#39;,</span>
    <span class="c1">// we send the whole batch block by block.</span>
    <span class="k">if</span> <span class="p">(</span><span class="nb">Math</span><span class="p">.</span><span class="nx">floor</span><span class="p">(</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span> <span class="o">/</span> <span class="nx">blockSize</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="nx">batchSize</span><span class="p">)</span> <span class="p">{</span>
      <span class="k">for</span> <span class="p">(</span><span class="nx">i</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">i</span> <span class="o">&lt;</span> <span class="nx">batchSize</span><span class="p">;</span> <span class="nx">i</span><span class="o">++</span><span class="p">)</span> <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">read</span><span class="p">(</span><span class="nx">blocksOut</span><span class="p">[</span><span class="nx">i</span><span class="p">])</span>
      <span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;read&#39;</span><span class="p">,</span> <span class="nx">data</span><span class="o">:</span> <span class="nx">blocksOut</span> <span class="p">})</span>
    <span class="p">}</span>

    <span class="c1">// Fill-up the &#39;read queue&#39; to at least `batchSize` blocks</span>
    <span class="k">while</span> <span class="p">((</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span> <span class="o">&lt;</span> <span class="p">(</span><span class="nx">batchSize</span> <span class="o">*</span> <span class="nx">blockSize</span><span class="p">))</span> 
      <span class="o">&amp;&amp;</span> <span class="p">(</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">process</span><span class="p">()</span> <span class="o">!==</span> <span class="mi">0</span><span class="p">))</span> <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span>

    <span class="k">break</span>
</pre></div>

</code></pre>
<p>Complete worker code can be found <a href="https://github.com/sebpiq/paulstretch.js/blob/master/examples/simple/js/paulstretch-worker.js">here</a>.</p>
<h1 id="communication-with-the-worker">Communication with the worker</h1>
<p>Now that all the parts are there, we will need to wire them up.</p>
<p>For this we will run in the main thread a function with <code>setInterval</code> that will periodically communicate with the worker : sending raw audio, and receiving processed audio.</p>
<p>Once again, for raw audio there is no problem, as we will send the blocks as they comes ... but for processed audio we will apply a similar technique as in the worker and use a buffer that should always contain at least <code>batchSize</code> blocks. Therefore, we check the state of our buffer <code>blocksOut</code> at each interval, and request new data from the worker only when the buffer runs low. </p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="nx">setInterval</span><span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksIn</span><span class="p">.</span><span class="nx">length</span><span class="p">)</span>
    <span class="nx">paulstretchWorker</span><span class="p">.</span><span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;write&#39;</span><span class="p">,</span> <span class="nx">data</span><span class="o">:</span> <span class="nx">blocksIn</span><span class="p">.</span><span class="nx">shift</span><span class="p">()</span> <span class="p">})</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksOut</span><span class="p">.</span><span class="nx">length</span> <span class="o">&lt;</span> <span class="nx">batchSize</span><span class="p">)</span> 
    <span class="nx">paulstretchWorker</span><span class="p">.</span><span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;read&#39;</span> <span class="p">})</span>
<span class="p">},</span> <span class="mi">100</span><span class="p">)</span>
</pre></div>

</code></pre>
<p>That&#39;s all there is to it! With this simple technique, you can use in web audio API processes that are too heavy to run in the main thread.</p>
<p>Let&#39;s recap :</p>
<p><strong>In the main thread</strong> </p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="kd">var</span> <span class="nx">blocksIn</span> <span class="o">=</span> <span class="p">[]</span>
  <span class="p">,</span> <span class="nx">blocksOut</span> <span class="o">=</span> <span class="p">[]</span>

<span class="nx">paulstretchNode</span><span class="p">.</span><span class="nx">onaudioprocess</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">event</span><span class="p">)</span> <span class="p">{</span>
  <span class="kd">var</span> <span class="nx">ch</span><span class="p">,</span> <span class="nx">block</span> <span class="o">=</span> <span class="p">[]</span>

  <span class="k">for</span> <span class="p">(</span><span class="nx">ch</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">ch</span> <span class="o">&lt;</span> <span class="nx">numberOfChannels</span><span class="p">;</span> <span class="nx">ch</span><span class="o">++</span><span class="p">)</span>
    <span class="nx">block</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="nx">event</span><span class="p">.</span><span class="nx">inputBuffer</span><span class="p">.</span><span class="nx">getChannelData</span><span class="p">(</span><span class="nx">ch</span><span class="p">))</span>
  <span class="nx">blocksIn</span><span class="p">.</span><span class="nx">push</span><span class="p">(</span><span class="nx">block</span><span class="p">)</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksOut</span><span class="p">.</span><span class="nx">length</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">block</span> <span class="o">=</span> <span class="nx">blocksOut</span><span class="p">.</span><span class="nx">shift</span><span class="p">()</span>
    <span class="k">for</span> <span class="p">(</span><span class="nx">ch</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">ch</span> <span class="o">&lt;</span> <span class="nx">numberOfChannels</span><span class="p">;</span> <span class="nx">ch</span><span class="o">++</span><span class="p">)</span>
      <span class="nx">event</span><span class="p">.</span><span class="nx">outputBuffer</span><span class="p">.</span><span class="nx">getChannelData</span><span class="p">(</span><span class="nx">ch</span><span class="p">).</span><span class="nx">set</span><span class="p">(</span><span class="nx">block</span><span class="p">[</span><span class="nx">ch</span><span class="p">])</span>
  <span class="p">}</span>
<span class="p">}</span>

<span class="nx">setInterval</span><span class="p">(</span><span class="kd">function</span><span class="p">()</span> <span class="p">{</span>
  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksIn</span><span class="p">.</span><span class="nx">length</span><span class="p">)</span>
    <span class="nx">paulstretchWorker</span><span class="p">.</span><span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;write&#39;</span><span class="p">,</span> <span class="nx">data</span><span class="o">:</span> <span class="nx">blocksIn</span><span class="p">.</span><span class="nx">shift</span><span class="p">()</span> <span class="p">})</span>

  <span class="k">if</span> <span class="p">(</span><span class="nx">blocksOut</span><span class="p">.</span><span class="nx">length</span> <span class="o">&lt;</span> <span class="nx">batchSize</span><span class="p">)</span> 
    <span class="nx">paulstretchWorker</span><span class="p">.</span><span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;read&#39;</span> <span class="p">})</span>
<span class="p">},</span> <span class="mi">100</span><span class="p">)</span>
</pre></div>

</code></pre>
<p><strong>In the web worker</strong></p>
<pre><code class="lang-javascript"><div class="highlight"><pre><span class="nx">onmessage</span> <span class="o">=</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">event</span><span class="p">)</span> <span class="p">{</span>
  <span class="k">switch</span> <span class="p">(</span> <span class="nx">event</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">type</span> <span class="p">)</span> <span class="p">{</span>
    <span class="k">case</span> <span class="s1">&#39;read&#39;</span><span class="o">:</span>
      <span class="kd">var</span> <span class="nx">i</span>

      <span class="c1">// Send audio from the buffer if there is at least `batchSize` blocks</span>
      <span class="k">if</span> <span class="p">(</span><span class="nb">Math</span><span class="p">.</span><span class="nx">floor</span><span class="p">(</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span> <span class="o">/</span> <span class="nx">blockSize</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="nx">batchSize</span><span class="p">)</span> <span class="p">{</span>
        <span class="k">for</span> <span class="p">(</span><span class="nx">i</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span> <span class="nx">i</span> <span class="o">&lt;</span> <span class="nx">batchSize</span><span class="p">;</span> <span class="nx">i</span><span class="o">++</span><span class="p">)</span> <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">read</span><span class="p">(</span><span class="nx">blocksOut</span><span class="p">[</span><span class="nx">i</span><span class="p">])</span>
        <span class="nx">postMessage</span><span class="p">({</span> <span class="nx">type</span><span class="o">:</span> <span class="s1">&#39;read&#39;</span><span class="p">,</span> <span class="nx">data</span><span class="o">:</span> <span class="nx">blocksOut</span> <span class="p">})</span>
      <span class="p">}</span>

      <span class="c1">// Fill-up the buffers to at least `batchSize` blocks</span>
      <span class="k">while</span> <span class="p">((</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span> <span class="o">&lt;</span> <span class="p">(</span><span class="nx">batchSize</span> <span class="o">*</span> <span class="nx">blockSize</span><span class="p">))</span> 
        <span class="o">&amp;&amp;</span> <span class="p">(</span><span class="nx">paulStretch</span><span class="p">.</span><span class="nx">process</span><span class="p">()</span> <span class="o">!==</span> <span class="mi">0</span><span class="p">))</span> <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">readQueueLength</span><span class="p">()</span>
      <span class="k">break</span>

    <span class="k">case</span> <span class="s1">&#39;write&#39;</span><span class="o">:</span>
      <span class="nx">paulStretch</span><span class="p">.</span><span class="nx">write</span><span class="p">(</span><span class="nx">event</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">data</span><span class="p">)</span>
      <span class="k">break</span>
    <span class="p">}</span>
  <span class="p">}</span>
<span class="p">}</span>
</pre></div>

</code></pre>
<p><a href="https://github.com/sebpiq/paulstretch.js/tree/master/examples/simple">The complete code of the example can be found here</a>.</p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/paulstretch.js';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/paulstretch.js'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
