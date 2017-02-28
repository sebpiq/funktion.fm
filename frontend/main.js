var $ = require('jquery')
  , _ = require('underscore')
  , Router = require('director').Router
  , d3 = require('d3-selection')
  , raf = require('./shim/raf')
  , FastButton = require('./shim/FastButton')
require('perfect-scrollbar/jquery')($)
require('d3-transition')

var animations = require('./drawing-tools/animations')
  , drawingUtils = require('./drawing-tools/utils')
  , drawings = require('./drawings')
  , context = require('./context')
  , Vertex

var initMainPageLayout = function(done) {
  $('#contactBody').hide()
  $('#projectsBody').hide()
  $('#newsBody').hide()
  $('#postBody').hide()
  $('#bgSvg').fadeIn(200)
  $('#mainPage').fadeOut(function() {
    $('#mainPage').fadeIn(done)
  })
}

var createSvgMenuItem = function(val, extraClass) {
  var text = context.svg.append('text')
  text.text(val)
    .attr('class', 'menuItem ' + extraClass)
    .attr('fill', 'black')

  text.moveToPosition = function(position) {
    this.attr('x', position[0])
      .attr('y', position[1])
  }

  return text
}

// Test for mobile devices
if (context.isMobile) 
  Vertex = require('./drawing-tools/vertices').Vertex
else 
  Vertex = require('./drawing-tools/vertices').GravitatingVertex

// Move the read more links to the last paragraph
$('#newsBody .preview .readMore').each(function() {
  $(this).prev('p').append(this)
})

// Expandable menu
var toggleNav = new FastButton($('header .toggle').get(0), function(event) {
  if ($('header').hasClass('expanded')) collapseMenu()
  else expandMenu()
})

var expandMenu = function() {
  $('header').addClass('expanded')
}

var collapseMenu = function() {
  $('header').removeClass('expanded')
}

$('nav .menu li').each(function(i, li) {
  new FastButton($(li).find('button').get(0), function() {
    var route
    if ($(li).hasClass('projects')) route = 'projects'
    else if ($(li).hasClass('contact')) route = 'contact'
    else if ($(li).hasClass('news')) route = 'news'
    router.setRoute('/' + route)
  })
})

// Creating menu items for contact page
projectsText = createSvgMenuItem('PROJECTS', 'projectsText')
projectsText.on('click', function() { router.setRoute('/projects') })
newsText = createSvgMenuItem('NEWS', 'newsText')
newsText.on('click', function() { router.setRoute('/news') })
contactText = createSvgMenuItem('funktion.fm', 'contactText')
contactText.on('click', function() { router.setRoute('/contact') })

// Create vertices
_.forEach(_.range(context.vertexCount), function(i) {
  context.vertices.push(new Vertex(
    (i%context.initialVertices.cols) * context.width/context.initialVertices.cols,
    Math.floor(i/context.initialVertices.cols) * context.width/context.initialVertices.rows)
  )
})

// Modal to display project tiles
var modal = {

  open: function(el) {
    el = $(el)
    var innerContent = $('<div>').appendTo('#modal .content')
      .html(el.clone())
    $('#modal').perfectScrollbar()
    $('#modal').fadeIn()
  },

  close: function() {
    $('#modal').fadeOut(function() {
      $('#modal .content').empty()
    })
  }

}
$('#modal .content').click(function(event) { event.stopPropagation() })
$('#modal').click(function(event) {
  modal.close()
  router.setRoute('/projects')
})

// Set click handlers to change the route when clicking on a project tile 
// or a link in concert list.
$('.tile').click(function(event) {
  router.setRoute($(this).attr('href'))
})
$('#concertsList a').click(function(event) {
  var url = $(this).attr('href')
  if (url.startsWith('/'))
    router.setRoute(url)
  else 
    window.open(url)
  event.preventDefault()
})
$('#newsBody .title a').click(function(event) {
  var url = $(this).attr('href')
  router.setRoute(url)
  event.preventDefault()
})

var routes = {
  '/contact': function() {
    modal.close()
    var cores = drawings.contact()
    animations.startTransition()

    newsText.moveToPosition([cores[1][0] - $('text.newsText').width() / 2, cores[1][1] + 10])
    projectsText.moveToPosition([cores[2][0] - $('text.projectsText').width() / 2, cores[2][1] + 10])
    $('header').fadeOut()
    initMainPageLayout(function() {
      d3.selectAll('text.menuItem').transition().style('opacity', 1)
      $('#contactBody').show()
    })
  },

  '/news': function() {
    modal.close()
    drawings.news()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      $('header').attr('class', 'news').fadeIn()
      $('#newsBody').show()
      $('#newsBody').perfectScrollbar()
    })

  },

  '/news/:postId': function(postId) {
    modal.close()
    drawings.news()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      $('header').attr('class', 'news').fadeIn()
      $('#postBody').show()
      $.get('/post/' + postId, function(postHtml) {
        $('#postBody').html(postHtml)
        $('#postBody .post').perfectScrollbar()
      })
    })
  },

  '/projects': function() {
    modal.close()
    routes._showProjectsPage()
  },

  '/projects/:tileId': function(tileId) {
    routes._showProjectsPage()

    // Show the tile
    var tile = $('.tile[href="/projects/' + tileId + '"]')
      , content = tile.find('.content')

    // Set the `src` on iframes, audio, etc ... to start loading those 
    content.find('img, iframe, audio, source').each(function() {
      var el = $(this)
      if (el.data('src'))
        el.attr('src', el.data('src'))
    })

    modal.open(content.find('>*'))

    $('#modal .content iframe').each(function() {
      $(this).css({ 'min-height': $('#modal .content').width() * 0.57 })
      $(this).css({'background-image': 'url("../images/spinner.gif")'})
    })
  },

  _showProjectsPage: function() {
    drawings.projects()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      var textGradient = drawingUtils.makeGradient([250, 250, 250], [0, 0, 0])
      $('header').attr('class', 'projects').show()
      $('#projectsBody')
        .fadeIn(300)
        .perfectScrollbar()

      $('#concertsList li > *').each(function(i, li) {
        var ratio = $(li).position().top / $('#concertsList').height()
        ratio = Math.min(1, ratio)
        $(li).css({ 'color': textGradient(ratio), 'opacity': 1.5 - ratio })
      })
    })
  }

}

var router = Router(routes)
router.configure({ html5history: true, strict: false })
if (window.location.pathname === '/') {
  // Redirect to not break old links with #
  if (location.hash) {
    var hash = location.hash.slice(1)
    location.hash = ''
    router.init(hash)
  }
  else router.init('/contact')
} else router.init()