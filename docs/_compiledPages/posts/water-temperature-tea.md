<div class="container">
  <div class="title">Brewing your tea properly.</div>
  <div class="date">posted the 22/09/2014</div>
  <div class="social">

    <a class="twitter" href=""
      onclick="
        window.open(
          'https://twitter.com/intent/tweet?text=Brewing your tea properly. ' + encodeURIComponent(location.href) + ' via @sebpiq',
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

  <div class="content"><p>With this simple calculator, you can finally brew your fancy tea at the proper temperature! </p>
<!--more-->
<p>Usage is very simple. Just input all the infos in the boxes below, and mix your <strong>V_boiled</strong> of boiled water with <strong>V_tap</strong> of tap water to get the desired <strong>T_brew</strong> temperature.</p>
<script type="text/javascript">

  // T_tap : temperature of tap water
  // T_brew : final temperature desired
  // V_boiled : volume of boiled water
  var calculate = function(T_tap, T_brew, V_boiled) {
    return V_boiled *  (100 - T_brew) / (T_brew - T_tap)
  }

  var refresh = function() {
    var T_tap = parseFloat($('input[name="T_tap"]').val())
      , T_brew = parseFloat($('input[name="T_brew"]').val())
      , V_boiled = parseFloat($('input[name="V_boiled"]').val())
      , V_tap = calculate(T_tap, T_brew, V_boiled)

    $('#V_tap').html('' + Math.round(V_tap * 1000) / 1000)
  }

  $(function() {
    refresh()
    $('input.water-temperature-tea').on('keyup', refresh)
  })

</script>

<p><input name="T_tap" class="water-temperature-tea" type="text" value="20" /> <strong>T_tap</strong> <em>temperature of the water coming out your tap (Celsius)</em></p>
<p><input name="T_brew" class="water-temperature-tea" type="text" value="70" /> <strong>T_brew</strong> <em>temperature desired for the brew (Celsius)</em></p>
<p><input name="V_boiled" class="water-temperature-tea" type="text" value="1"/> <strong>V_boiled</strong> <em>volume of boiled water (Liters)</em></p>
<p><span id="V_tap" style="font-weight:bold;padding:0.5em;background-color:#aaa"></span> <strong>V_tap</strong> <em>volume of tap water to add to the boiled water (Liters)</em></p>
<p>Of course this is a bit approximative, as you most likely don&#39;t know the exact temperature of your tap water, and volumes are approximated as well, and mass volumique of water is not temperature-constant, ... blablabla </p>
</div>   

  <div id="disqus_thread"></div>
  <script>

  var disqus_config = function () {
  this.page.url = 'http://funktion.fm/posts/water-temperature-tea';  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = 'posts/water-temperature-tea'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
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
