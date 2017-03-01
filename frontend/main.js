var $ = require('jquery')
var _ = require('underscore')
var Router = require('director').Router
var d3 = require('d3-selection')
var raf = require('./shim/raf')
var FastButton = require('./shim/FastButton')
require('perfect-scrollbar/jquery')($)
require('d3-transition')
window.$ = $ // needed by some posts using JS

var animations = require('./drawing-tools/animations')
var drawingUtils = require('./drawing-tools/utils')
var drawings = require('./drawings')
var context = require('./context')
var Vertex

// Test for mobile devices
if (context.isMobile) 
  Vertex = require('./drawing-tools/vertices').Vertex
else 
  Vertex = require('./drawing-tools/vertices').GravitatingVertex

// Expandable top menu
var toggleNav = new FastButton($('header .toggle').get(0), function(event) {
  if ($('header').hasClass('expanded')) collapseMenu()
  else expandMenu()
})
function expandMenu() { $('header').addClass('expanded') }
function collapseMenu() { $('header').removeClass('expanded') }

// Creating SVG menu items for contact page
function createSvgMenuItem(val, extraClass) {
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
projectsText = createSvgMenuItem('PROJECTS', 'projectsText')
projectsText.on('click', function() { router.setRoute('/projects') })
newsText = createSvgMenuItem('NEWS', 'newsText')
newsText.on('click', function() { router.setRoute('/news') })
contactText = createSvgMenuItem('funktion.fm', 'contactText')
contactText.on('click', function() { router.setRoute('/contact') })

// Create vertices for animated SVG background
_.forEach(_.range(context.vertexCount), function(i) {
  context.vertices.push(new Vertex(
    (i%context.initialVertices.cols) * context.width/context.initialVertices.cols,
    Math.floor(i/context.initialVertices.cols) * context.width/context.initialVertices.rows)
  )
})

// Set all click handlers for changing routes
new FastButton($('nav .menu li.posts button').get(0), function() { router.setRoute('/news') })
new FastButton($('nav .menu li.projects button').get(0), function() { router.setRoute('/projects') })
new FastButton($('nav .menu li.contact button').get(0), function() { router.setRoute('/contact') })

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
$('#postList .title a').click(function(event) {
  router.setRoute($(this).attr('href'))
  event.preventDefault()
})

var routes = {
  '/contact': function() {
    var cores = drawings.contact()
    animations.startTransition()

    newsText.moveToPosition([cores[1][0] - $('text.newsText').width() / 2, cores[1][1] + 10])
    projectsText.moveToPosition([cores[2][0] - $('text.projectsText').width() / 2, cores[2][1] + 10])
    $('header').fadeOut()
    routes._initMainPageLayout(function() {
      d3.selectAll('text.menuItem').transition().style('opacity', 1)
      $('#contact').show()
    })
  },

  '/news': function() {
    drawings.posts()
    routes._notContact(function() {
      $('header').attr('class', 'posts').fadeIn()
      $('#postList').show()
      $('#postList').perfectScrollbar()
    })
  },

  '/news/:filename': function(filename) {
    drawings.posts()
    routes._notContact(function() {
      $('header').attr('class', 'posts').fadeIn()
      $('#postDetail').show()
      routes._loadTextPage('/_partials/posts/' + filename + '.md', $('#postDetail'))
    })
  },

  '/projects': function() {
    drawings.projects()
    routes._notContact(function() {
      var textGradient = drawingUtils.makeGradient([250, 250, 250], [0, 0, 0])
      $('header').attr('class', 'projects').show()
      $('#projectList')
        .fadeIn(300)
        .perfectScrollbar()

      $('#concertsList li > *').each(function(i, li) {
        var ratio = $(li).position().top / $('#concertsList').height()
        ratio = Math.min(1, ratio)
        $(li).css({ 'color': textGradient(ratio), 'opacity': 1.5 - ratio })
      })
    })
  },

  '/projects/:tileId': function(tileId) {
    drawings.projects()
    routes._notContact(function() {
      $('header').attr('class', 'projects').show()
      routes._loadTextPage('/_partials/projects/' + tileId + '.md', $('#projectDetail'))
    })
  },

  // Common things for all pages that are not "contact" page
  _notContact: function(done) {
    animations.startTransition()
    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()
    routes._initMainPageLayout(done)
  },

  // Helper to load a page from an html partial to a container
  _loadTextPage: function(url, container, done) {
    $.get(url, function(content) {
      container.html(content)

      // Set the `src` on iframes, audio, etc ... to start loading those 
      container.find('img, iframe, audio, source').each(function() {
        var el = $(this)
        if (el.data('src'))
          el.attr('src', el.data('src'))
      })

      container.find('code pre')
        .perfectScrollbar()

      container
        .perfectScrollbar()
        .fadeIn(300, function() {
          container.find('.content iframe').each(function() {
            $(this).css({ 'min-height': container.find('.content').width() * 0.57 })
            $(this).css({ 'background-image': 'url("../images/spinner.gif")' })
          })
          if (done) done()
        })

    })
  },

  _initMainPageLayout: function(done) {
    $('.page').hide()
    done()
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