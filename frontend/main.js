var _ = require('underscore')
  , Router = require('director').Router
  , raf = require('./shim/raf')
  , FastButton = require('./shim/FastButton')
  , tessellations = require('./drawing-tools/tessellations')
  , drawings = require('./drawings')
  , context = require('./context')
  , config = require('./config')

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
  var classed = {'menuItem': true}
    , text = context.svg.append('text')

  classed[extraClass] = true
  text.text(val)
    .classed(classed)

  text.moveToPosition = function(position) {
    this.attr('x', function(d) { return position[0] })
      .attr('y', function(d) { return position[1] })
  }

  return text
}


// Test for mobile devices
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  var Vertex = require('./drawing-tools/Vertex')
  context.isMobile = true
} else var Vertex = require('./drawing-tools/GravitatingVertex')

// Move the read more links to the last paragraph
$('#newsBody .preview .readMore').each(function() {
  $(this).prev('p').append(this)
})

// Window width and height
context.width = $(window).width()
context.height = $(window).height()

// Get d3 selections
context.svg = d3.select('#bgSvg')
  .attr('width', context.width)
  .attr('height', context.height)
  .attr('class', 'PiYG')
context.path = context.svg.append('g').selectAll('path')

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
    window.location.hash = '/' + $(li).attr('class')
  })
})

// Creating menu items for contact page
projectsText = createSvgMenuItem('PROJECTS', 'projectsText')
projectsText.on('click', function() { window.location.hash = '/projects' })
newsText = createSvgMenuItem('NEWS', 'newsText')
newsText.on('click', function() { window.location.hash = '/news' })
contactText = createSvgMenuItem('funktion.fm', 'contactText')
contactText.on('click', function() { window.location.hash = '/contact' })

// Create the vertices
_.forEach(_.range(config.vertexCount), function(i) {
  context.vertices.push(new Vertex(
    (i%config.initialVertices.cols) * context.width/config.initialVertices.cols,
    Math.floor(i/config.initialVertices.cols) * context.width/config.initialVertices.rows)
  )
})

// Object to handle animations of the vertices positions,
// transitions between one drawing and another, but also gravitation.
// The actual calculations for each frame are handled by the vertices themselves.
// This object is just handling timing.
var animations = {

  startTime: 0,
  rafHandle: null, // handle to cancel an animation frame

  startTransition: function() {
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle)
    this.startTime = +(new Date)
    this.rafHandle = requestAnimationFrame(this._transitionFrame)
  },

  // Should be called with `progress` during a transition. `progress` is a number
  // between 0 and 1.
  _redraw: function(progress) {
    _.forEach(context.vertices, function(v) { v.nextFrame(progress) })
    tessellations.draw()
  },

  _transitionFrame: function() {
    var progress = Math.min((+(new Date) - this.startTime) / config.transitionTime, 1)
    this._redraw(progress)
    if (progress < 1)
      this.rafHandle = requestAnimationFrame(this._transitionFrame)
    // If the browser is desktop, we continue animating even when the transition is over
    else if (!context.isMobile)
      this.rafHandle = requestAnimationFrame(this._redrawLoop)
  },

  _redrawLoop: function() {
    this._redraw()
    this.rafHandle = requestAnimationFrame(this._redrawLoop)
  }
}
animations._transitionFrame = _.bind(animations._transitionFrame, animations)
animations._redrawLoop = _.bind(animations._redrawLoop, animations)


// Modal to display project tiles
var modal = {

  open: function(el) {
    el = $(el)
    var innerContent = $('<div>').appendTo('#modal .content')
      .html(el.clone())
    $('#modal').fadeIn(function() {
      innerContent.css({ overflow: 'auto' })
      innerContent.jScrollPane()
    })
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
  window.location.hash = '/projects'
})
$('.tile').click(function() {
  window.location.hash = $(this).attr('href')
})

var routes = {
  '/contact': function() {
    var cores = drawings.contact()
    animations.startTransition()

    newsText.moveToPosition([cores[1][0] - newsText.text().length * 10, cores[1][1] + 7])
    projectsText.moveToPosition([cores[2][0] - projectsText.text().length * 8, cores[2][1] + 7])
    $('header').fadeOut()
    initMainPageLayout(function() {
      d3.selectAll('text.menuItem').transition().style('opacity', 1)
      $('#contactBody').show()
    })
  },

  '/news': function() {
    drawings.news()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      $('header').attr('class', 'news').fadeIn()
      $('#newsBody').show()
      // We need to wait for the div to show before initializing the scrollbars
      if (!$('#newsBody').hasClass('jspScrollable'))
        $('#newsBody').jScrollPane({ hideFocus: true })
    })

  },

  '/post/:postId': function() {
    drawings.news()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      $('header').attr('class', 'news').fadeIn()
      $('#postBody').show()
      $.get(window.location.hash.substr(1), function(postHtml) {
        $('#postBody').html(postHtml)
        $('#postBody .post').jScrollPane({ hideFocus: true, autoReinitialise: true })
      })
    })
  },

  '/projects': function() {
    routes._showProjectsPage()
  },

  '/projects/:tileId': function(tileId) {
    routes._showProjectsPage()

    // Show the tile
    var tile = $('.tile[href="#/projects/' + tileId + '"]')
      , content = tile.find('.content')

    // Set the `src` on iframes, audio, etc ... to start loading those 
    content.find('img, iframe, audio, source').each(function() {
      var el = $(this)
      if (el.data('src')) el.attr('src', el.data('src'))
    })

    modal.open(content.find('>*'))
    $('#modal .content iframe').each(function() {
      $(this).css({ 'min-height': $('#modal .content').width() * 0.57 })
    })
  },

  _showProjectsPage: function() {
    drawings.projects()
    animations.startTransition()

    d3.selectAll('text.menuItem').transition().style('opacity', 0)
    collapseMenu()

    initMainPageLayout(function() {
      $('header').attr('class', 'projects').show()
      $('#projectsBody').fadeIn(300)
      // We need to wait for the div to show before initializing the scrollbars
      if (!$('#projectsBody').hasClass('jspScrollable'))
        $('#projectsBody').jScrollPane({ hideFocus: true })
    })
  }

}
var router = Router(routes)
router.init()
window.location.hash = window.location.hash || '#contact'
