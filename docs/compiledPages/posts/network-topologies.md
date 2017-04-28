<div class="container">
  <div class="title">Rhizome, interactive performances and network topologies</div>
  <div class="date">posted the 25/08/2015</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Rhizome, interactive performances and network topologies ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p><a href="http://funktion.fm/projects/murmurate">Fields</a> and <a href="http://funktion.fm/projects/newweave">New weave</a> are two interactive performances which allow audience members to participate by using their mobile phone. They use a tool which I have released about one and a half years ago, and which is called <a href="http://github.com/sebpiq/rhizome">rhizome</a>.</p>
<p>In this post, I will quickly introduce <strong>rhizome</strong>, and explain what kind of network setup, equipment and configuration I use for these live performances.</p>
<!--more-->
<h1 id="about-rhizome">About rhizome</h1>
<p><a href="http://github.com/sebpiq/rhizome">rhizome</a> is a web server which allows to build participative performances by connecting audience&#39;s and performers&#39; devices via <strong>OSC and websockets</strong>. It is packaged so that you should be able to install it and set-it up, even if you have no experience in programming. However, more advanced users can also configure everything, or program their own server from scratch by using rhizome base classes and functions (API not documented yet).</p>
<p>rhizome is built with the following aspects in mind, critical for a live performance situation :</p>
<ul>
<li><strong>reliability</strong> : it shouldn&#39;t crash, and if it does it should be able to restore all the connections</li>
<li><strong>speed</strong> : it should be optimized so that many messages can be sent</li>
<li><strong>scalability</strong> : it should support 10 connections or 10000</li>
<li><strong>inter-operability</strong> : it should be able to work with Pure Data, Max, Processing ...</li>
</ul>
<p>Making rhizome easy enough to use for non-programmers, while keeping it neat, flexible, fast, reliable, scalable ... is not an easy task. And though there is still a lot of work, <a href="https://github.com/sebpiq/rhizome/issues">things to fix and things to implement</a>, it is slowly getting there. I am happy to see that a few people have used it successfully <a href="https://github.com/sebpiq/rhizome/wiki/Gallery">for their own performances</a>, and I hope more people will use it in the future, for the more it is used, the better it will become.</p>
<p>Now, one recurrent question I get is, </p>
<p><strong>&quot;How do you setup a wireless network and what equipment do you use?&quot;</strong></p>
<p>And so here are a few pointers ...</p>
<h1 id="network-topology-and-equipment">Network topology and equipment</h1>
<h2 id="small-performances-15-connections">Small performances &lt; 15 connections</h2>
<p>For very small performances, you don&#39;t really need any fancy network equipment :</p>
<p><img src="https://raw.githubusercontent.com/sebpiq/rhizome/master/images/network-diagram1.png" style="max-width:100%;width:25em;"/></p>
<ul>
<li><p><strong>WIFI router</strong> : can be any home WIFI router. Typically, those cost between 15 and 50 euros. personnally I have this cheap <a href="http://www.tp-link.fi/products/details/cat-9_TL-WR841ND.html">TP-link router</a> which worked alright for performances with 10-12 connections (more than that it starts to choke a bit). I just happened to have this one at home for my own WIFI network, but any cheap home router will do.</p>
</li>
<li><p><strong>rhizome server</strong> : is basically a computer that runs rhizome. I usually use my own Ubuntu laptop, which I optimize for the occasion (I&#39;ll talk about deployment in a next blog post). You can use any computer as long as you can install <strong>node.js</strong> on it. I have even performed with rhizome running from a Raspberry Pi (quite slow).</p>
</li>
</ul>
<h2 id="the-apple-airport-express-option">The Apple Airport Express option</h2>
<p>This is an option that is worth mentioning. The <a href="https://www.apple.com/airport-extreme/">Apple Airport Extreme</a> supports up to 50 wireless connections. So if that is enough for your use, you should consider using this (overpriced but quite powerful router) instead of the more complex solution I will detail below.</p>
<h2 id="middle-sized-performances-250-connections">Middle-sized performances &lt; 250 connections</h2>
<p>A home WIFI router is typically a combination of a router, a switch and a WIFI access point, all integrated into a single device. If you expect up to 250 connections, you will need a network that can scale. For this you have to buy and install all router, switch and access points separately.</p>
<p>This is the setup I have been using : </p>
<p><img src="https://raw.githubusercontent.com/sebpiq/rhizome/master/images/network-diagram2.png" style="max-width:100%;width:30em;"/></p>
<ul>
<li><p><strong>Router</strong> : this is a <strong>wired</strong> router. Its role is to attribute IP addresses to devices on the network and route messages from one device to another. The router is the reason for the 250 limit. On a single network, there is only 255 IP addresses available. Some are reserved, and you will need a couple more for the rhizome server, access points, ... which brings us down to 250, probably less in most cases.</p>
</li>
<li><p><strong>Switch</strong> : the role of a switch is to connect several devices to the same network. It is <strong>a bit</strong> like a multi-socket but for ethernet cables ...</p>
</li>
<li><p><strong>WIFI access point</strong> : the name is pretty self-explanatory. These devices provide wireless access to phones, tablets, computers ... Check carefully before buying those because they typically support only a small number of connections. Therefore you will most likely need to buy several of them. The access points I use for example support up to 50 people. Therefore to support 250 people, I would need 5 of them. Also, make sure that you have enough space on your switch!!!</p>
</li>
</ul>
<p>Such network equipment is usually quite expensive and can be complicated to configure. Not every router is compatible with every access point. I recommend the brand <strong>Ubiquiti</strong> which has very affordable products and is very easy to set-up. I&#39;ve used <a href="https://www.ubnt.com/edgemax/edgerouter-lite/">this router</a> from them, with several of <a href="https://www.ubnt.com/unifi/unifi-ap/">these access points</a>.</p>
<h2 id="250-i-am-planning-to-perform-in-a-stadium-">250++, I am planning to perform in a stadium!</h2>
<p>Rhizome is not ready for that. The bottleneck here is how many concurrent connections the websocket server can handle. Answers to that question vary wildly (from 100 to 1 million!), it depends on your computer, your OS, on how many messages you send, if you send big files, etc, etc ... </p>
<p>Anyways, in order to scale up, you should be able to run several rhizome servers, and have them communicate with each other in order to share messages and reach all the connections. This is something that is planned, but probably not before version 0.9.0.</p>
<h1 id="configuring-tips">Configuring tips</h1>
<p>Ok ... now you have all the gear, how do you configure it? Well ... that completely depends on what brand it is, but here are a few general advices and things to keep in mind.</p>
<h2 id="accessing-the-configuration-interface-of-your-router-wired-or-wireless-">Accessing the configuration interface of your router (wired or wireless)</h2>
<p>Most routers can be configured via a web interface. You just need to connect a computer to that router (via cable or wireless), figure out what is the IP of the router (<code>XXX.YYY.ZZZ.1</code>, where <code>XXX</code>, <code>YYY</code> and <code>ZZZ</code> are the 3 first numbers of your computer&#39;s IP address), open a web browser and go to that router&#39;s IP address. The login and password for the configuration interface are usually given in the user guide of the router.</p>
<h2 id="attributing-fixed-ip-addresses-to-the-rhizome-server-and-access-points">Attributing fixed IP addresses to the rhizome server and access points</h2>
<p>When a device connects, your router&#39;s DHCP server will attribute a free IP address to that device. However, you might want the rhizome server and some other key devices - like your access points - to always get the same IP address from the DHCP server. This can usually be configured via your router&#39;s configuration interface. Look for the DHCP section, then look for something like &quot;static IP mapping&quot;. </p>
<h2 id="limiting-the-number-of-connections">Limiting the number of connections</h2>
<p>If for any reason you want to limit the number of people that can connect to your network, you can configure the DHCP server of your router to attribute IP addresses only within a certain range. For example if you want to limit to 30 connections, you can have the DHCP attribute only IPs within <code>XXX.YYY.ZZZ.100</code> and <code>XXX.YYY.ZZZ.130</code>. If you do this though, make sure that you have a short DHCP lease time. Otherwise if somebody connects and then leaves, its IP address will be blocked.</p>
<h2 id="wifi-network-protection">WIFI network protection</h2>
<p>In most cases, it is fine to not have a password on your WIFI network. It is faster for people to connect. However, if you play in a venue will a lot of people passing near-by (for example a festival or a public space), phones from passerbys might automatically connect to your network, taking space for nothing. In that case it might be a good idea to protect the network with a simple password, so that only participants can connect.</p>
<p><a href="http://twitter.com/sebpiq/status/636197123587969024">comments</a></p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/network-topologies';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/network-topologies'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
