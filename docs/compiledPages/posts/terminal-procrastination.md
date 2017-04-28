<div class="container">
  <div class="title">Audio glitches with a linux terminal</div>
  <div class="date">posted the 15/01/2016</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Audio glitches with a linux terminal ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p>Here is an old hack with a terminal to listen to the guts of your computer.</p>
<p>Before starting, here are a couple of tracks by <a href="https://bitsnibblesbytes.wordpress.com/">Stephen Stamper</a>, which were partly produced with this technique :</p>
<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/34843548&amp;color=0066cc&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe>
<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/90038560&amp;color=0066cc&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe>

<p><code>aplay</code> is a great tool available on most linux distributions which allows you to read raw data, and interpret it as audio. You just give it the data source, tell it how to interpret it (sample rate, sample format, number of channels) and it will play it back.</p>
<p><strong>note1</strong> : on OSX you can achieve the same results with <a href="http://sox.sourceforge.net/">sox</a>.</p>
<p><strong>note2</strong> : be careful with the volume of your speakers or headphones. All these audio examples are quite loud.</p>
<p>Let&#39;s start by sending <code>aplay</code> an mp3 file to see how it sounds :</p>
<p><img src="/audio/terminal-procrastination/wf1.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/1.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/1.mp3" type="audio/mp3">
</audio></p>
<pre><code class="lang-bash"><div class="highlight"><pre>cat ~/Music/Cameosis/03-Cameo-PleaseYou.mp3 <span class="p">|</span> aplay -r <span class="m">8000</span> -c2
</pre></div>

</code></pre>
<p>Here you can see the basic technique. <code>cat</code> will just read a file, and send it to its output, then you use the pipe character <strong>|</strong> to send that output to <code>aplay</code> which will interepret the bytes as audio and play that audio back. <code>-r 8000</code> means that we interpret the sound with sample rate of <em>8000hz</em>, <code>-c2</code> means stereo.</p>
<p>I don&#39;t have a mac to test, but according to Stephen, on OSX the equivalent command would be :</p>
<pre><code class="lang-bash"><div class="highlight"><pre>cat ~/Music/Cameosis/03-Cameo-PleaseYou.mp3 <span class="p">|</span> sox -q -t raw -r <span class="m">8000</span> -b <span class="m">8</span> -e unsigned-integer - -t coreaudio vol 0.5
</pre></div>

</code></pre>
<p>With this particular file, as with most files, the result is not very exciting ... mostly white noise. This is because the raw data in a mp3 file is not periodical. There is however a lot of files in your computer that have a repetitive structure, and can make very interesting sounds. For example :</p>
<p><img src="/audio/terminal-procrastination/wf2.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/2.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/2.mp3" type="audio/mp3">
</audio></p>
<pre><code class="lang-bash"><div class="highlight"><pre>sudo cat /var/log/mongodb/mongodb.log <span class="p">|</span> aplay -c2 -f MU_LAW
</pre></div>

</code></pre>
<p><img src="/audio/terminal-procrastination/wf3.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/3.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/3.mp3" type="audio/mp3">
</audio></p>
<pre><code class="lang-bash"><div class="highlight"><pre>sudo cat /var/log/mongodb/mongodb.log <span class="p">|</span> aplay -c2 -r <span class="m">4000</span> -f MU_LAW
</pre></div>

</code></pre>
<p><img src="/audio/terminal-procrastination/wf4.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/4.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/4.mp3" type="audio/mp3">
</audio></p>
<pre><code class="lang-bash"><div class="highlight"><pre>sudo cat /var/lib/mongodb/overwhelmed.0 <span class="p">|</span> aplay -c2 -f MU_LAW
</pre></div>

</code></pre>
<p><code>-f MU_LAW</code> here specifies the format of the sound. There is several different formats you can use, and choosing a different format will have a big impact on the sound. Available formats are listed in <code>aplay</code> documentation (which you can read by typing <code>man aplay</code>).</p>
<p>Above I used a database as input, and log files. These all have a periodical structure, and you can hear it reflected in the sounds generated.</p>
<p>You can also use live data as input to <code>aplay</code>. For example devices from your system :</p>
<p><img src="/audio/terminal-procrastination/wf5.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/5.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/5.mp3" type="audio/mp3">
</audio></p>
<pre><code><div class="highlight"><pre><span class="nx">sudo</span> <span class="nx">cat</span> <span class="o">/</span><span class="nx">dev</span><span class="o">/</span><span class="nx">vga_arbiter</span> <span class="o">|</span> <span class="nx">aplay</span> <span class="o">-</span><span class="nx">r</span> <span class="mi">2000</span> <span class="o">-</span><span class="nx">c2</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">MU_LAW</span>
</pre></div>

</code></pre><p>The result here is quite boring as the data is not changing. However we can get more interesting sounds with data from <code>tcpdump</code> - which captures the traffic from your network connection :</p>
<p><img src="/audio/terminal-procrastination/wf6.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/6.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/6.mp3" type="audio/mp3">
</audio></p>
<pre><code><div class="highlight"><pre><span class="nx">sudo</span> <span class="nx">tcpdump</span> <span class="o">-</span><span class="nx">vvv</span> <span class="o">-</span><span class="nx">i</span> <span class="nx">wlan0</span> <span class="o">|</span> <span class="nx">aplay</span> <span class="o">-</span><span class="nx">c2</span> <span class="o">-</span><span class="nx">r</span> <span class="mi">2000</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">FLOAT_LE</span>
</pre></div>

</code></pre><p>And finally - one that I quite like - you can listen to your webcam by using a software called <code>ffmpeg</code> to capture input from the cam and piping it to <code>aplay</code> as we did before. The sonic results are surprising deep and complex, though the sound doesn&#39;t really change :</p>
<p><img src="/audio/terminal-procrastination/wf7.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/7.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/7.mp3" type="audio/mp3">
</audio></p>
<pre><code><div class="highlight"><pre><span class="nx">ffmpeg</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">v4l2</span> <span class="o">-</span><span class="nx">i</span> <span class="o">/</span><span class="nx">dev</span><span class="o">/</span><span class="nx">video0</span> <span class="o">-</span><span class="nx">vf</span> <span class="nx">scale</span><span class="o">=</span><span class="mi">100</span><span class="o">:</span><span class="mi">100</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">rawvideo</span> <span class="nx">pipe</span><span class="o">:</span> <span class="o">|</span> <span class="nx">aplay</span> <span class="o">-</span><span class="nx">r</span> <span class="mi">2000</span> <span class="o">-</span><span class="nx">c2</span>
</pre></div>

</code></pre><p><img src="/audio/terminal-procrastination/wf8.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/8.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/8.mp3" type="audio/mp3">
</audio></p>
<pre><code><div class="highlight"><pre><span class="nx">ffmpeg</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">v4l2</span> <span class="o">-</span><span class="nx">i</span> <span class="o">/</span><span class="nx">dev</span><span class="o">/</span><span class="nx">video0</span> <span class="o">-</span><span class="nx">vf</span> <span class="nx">scale</span><span class="o">=</span><span class="mi">6000</span><span class="o">:</span><span class="mi">6000</span> <span class="o">-</span><span class="nx">f</span> <span class="nx">rawvideo</span> <span class="nx">pipe</span><span class="o">:</span> <span class="o">|</span> <span class="nx">aplay</span> <span class="o">-</span><span class="nx">r</span> <span class="mi">2000</span> <span class="o">-</span><span class="nx">c2</span>
</pre></div>

</code></pre><p>So yes ... you can try to pipe <strong>|</strong> pretty much anything to your <code>aplay</code> ... hours of procrastination lie ahead.</p>
<p>And if nothing of these work for you, you can always run this command in your terminal to get some colorfull glitches :</p>
<pre><code class="lang-bash"><div class="highlight"><pre><span class="nb">echo</span> -e <span class="s2">&quot;#coding=utf8\nimport sys,random as r;c=0;p=&#39; &#39;*6\nwhile 1:p,c=(&#39; &#39;*r.randint(3,200),r.randint(20,99)) if r.random()&gt;0.999 else (p,c);sys.stdout.write(&#39;\033[%sm&#39;%c+(&#39;▚&#39;*15 if r.random()&gt;0.995 else &#39;▚&#39;*16)+p)&quot;</span> <span class="p">|</span> python
</pre></div>

</code></pre>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/terminal-procrastination';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/terminal-procrastination'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
