var _ = require('underscore')
  , Router = require('director').Router
  , raf = require('./raf')
  , Vertex = require('./drawing-tools/Vertex')
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
if(/webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

  $('body').html('Unfortunately this site doesn\'t support mobile devices yet.')

} else {

  // Add scroll bars
  $('#projectsBody').jScrollPane({ hideFocus: true })
  $('#newsBody').jScrollPane({ hideFocus: true })

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

  // Create the vertices
  _.forEach(_.range(config.vertexCount), function(i) {
    context.vertices.push(new Vertex(
      (i%config.initialVertices.cols) * context.width/config.initialVertices.cols,
      Math.floor(i/config.initialVertices.cols) * context.width/config.initialVertices.rows)
    )
  })

  // Expandable menu
  $('#nav .toggle').click(function(event) {
    event.preventDefault()
    if ($('#nav').hasClass('expanded')) collapseMenu()
    else expandMenu()
  })

  var expandMenu = function() {
    $('#nav').addClass('expanded')
    $('#nav .menu').slideDown(200)
  }

  var collapseMenu = function() {
    $('#nav .menu').slideUp(200, function() {
      $('#nav').removeClass('expanded')
    })    
  }

  // Creating menu items for contact page
  projectsText = createSvgMenuItem('PROJECTS', 'projectsText')
  projectsText.on('click', function() { window.location.hash = 'projects' })
  newsText = createSvgMenuItem('NEWS', 'newsText')
  newsText.on('click', function() { window.location.hash = 'news' })
  contactText = createSvgMenuItem('funktion.fm', 'contactText')
  contactText.on('click', function() { window.location.hash = 'contact' })

  // Function to start animation between a drawing and another
  var startAnimation = function() {
    var startTime = +(new Date)

    var nextFrame = function() {
      console.log(+(new Date))
      var progress = (+(new Date) - startTime) / config.transitionTime
      _.forEach(context.vertices, function(v) { v.nextFrame(progress) })
      tessellations.draw()
      if (progress < 1) requestAnimationFrame(nextFrame)
    }

    requestAnimationFrame(nextFrame)

  }

  // Handler for when clicked on a project tile 
  var projectFocused = null
  $('#projectsBody .project').click(function() {
    var project = $(this)

    var focusToProject = function() {
      projectFocused = project
      project.find('.thumbnail').fadeOut(100, function() {
        project.addClass('expanded')
        project.find('.content').fadeIn(100)
      })
    }

    if (projectFocused) {
      if (project.is(projectFocused)) return
      projectFocused.find('.content').fadeOut(100, function() {
        projectFocused.removeClass('expanded')
        projectFocused.find('.thumbnail').fadeIn(100)
        focusToProject()
      })
    } else focusToProject()
  })

  var routes = {
    '/contact': function() {
      var cores = drawings.contact()
      requestAnimationFrame(startAnimation)

      newsText.moveToPosition([cores[1][0] - newsText.text().length * 10, cores[1][1] + 7])
      projectsText.moveToPosition([cores[2][0] - projectsText.text().length * 8, cores[2][1] + 7])
      $('#nav').fadeOut()
      initMainPageLayout(function() {
        d3.selectAll('text.menuItem').transition().style('opacity', 1)
        $('#contactBody').show()
      })
    },

    '/news': function() {
      drawings.news()
      requestAnimationFrame(startAnimation)

      d3.selectAll('text.menuItem').transition().style('opacity', 0)
      collapseMenu()

      initMainPageLayout(function() {
        $('#nav').attr('class', 'news').show()
        $('#newsBody').show()
      })

    },

    '/post/:postId': function() {
      drawings.news()
      requestAnimationFrame(startAnimation)

      d3.selectAll('text.menuItem').transition().style('opacity', 0)
      collapseMenu()

      initMainPageLayout(function() {
        $('#nav').attr('class', 'news').show()
        $('#postBody').show()
        $.get(window.location.hash.substr(1), function(postHtml) {
          $('#postBody').html(postHtml)
          $('#postBody .post').jScrollPane({ hideFocus: true })
        })
      })
    },

    '/projects': function() {
      drawings.projects()
      requestAnimationFrame(startAnimation)

      d3.selectAll('text.menuItem').transition().style('opacity', 0)
      collapseMenu()

      initMainPageLayout(function() {
        $('#nav').attr('class', 'projects').show()
        $('#projectsBody').show()
      })
    },

    '/projects/:projectName': function() {

    }
  }
  var router = Router(routes)
  router.init()
  window.location.hash = window.location.hash || '#contact'

}