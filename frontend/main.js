var _ = require('underscore')
  , Router = require('director').Router
  , Vertex = require('./drawing-tools/Vertex')
  , tessellations = require('./drawing-tools/tessellations')
  , drawings = require('./drawings')
  , context = require('./context')
  , config = require('./config')

var initMainPageLayout = function() {
  $('#mainPage').fadeIn()
  $('#mainPage .menu li').css({'text-decoration': 'none'})
  $('#contactBody').fadeOut()
  $('#projectsBody').fadeOut()
  $('#newsBody').fadeOut()
  $('#bgSvg').fadeIn(200)
}

var showMainPageMenu = function() {
  d3.selectAll('text.menuItem').transition().style('opacity', 0)
  $('#mainPage .menu').fadeIn()
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

// onload
$(function() {

  // Test for mobile devices
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

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

    // Creating menu items for contact page
    projectsText = createSvgMenuItem('PROJECTS', 'projectsText')
    projectsText.on('click', function() { window.location.hash = 'projects' })
    newsText = createSvgMenuItem('NEWS', 'newsText')
    newsText.on('click', function() { window.location.hash = 'news' })
    contactText = createSvgMenuItem('funktion.fm', 'contactText')
    contactText.on('click', function() { window.location.hash = 'contact' })

    // Animate the thing
    tessellations.draw()
    setInterval(function() {
      _.forEach(context.vertices, function(v) { v.nextFrame() })
      tessellations.draw()
    }, 20)

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
        newsText.moveToPosition([cores[1][0] - newsText.text().length * 10, cores[1][1] + 7])
        projectsText.moveToPosition([cores[2][0] - projectsText.text().length * 8, cores[2][1] + 7])
        initMainPageLayout()
        d3.selectAll('text.menuItem').transition().style('opacity', 1)
        $('#mainPage .menu').fadeOut()
        $('#contactBody').fadeIn()
      },

      '/news': function() {
        drawings.news()
        initMainPageLayout()
        showMainPageMenu()
        $('#mainPage .menu').addClass('news').removeClass('contact').removeClass('projects')
        $('#postBody').fadeOut(function() { $('#newsBody').fadeIn() })
      },

      '/post/:postId': function() {
        drawings.news()
        initMainPageLayout()
        showMainPageMenu()
        $('#mainPage .menu').addClass('news').removeClass('contact').removeClass('projects')
        $('#newsBody').fadeOut(function() {
          $.get(window.location.hash.substr(1), function(postHtml) {
            $('#postBody').fadeIn()
            $('#postBody').html(postHtml)
            $('#postBody .post').jScrollPane({ hideFocus: true })
          })
        })
      },

      '/projects': function() {
        drawings.projects()
        initMainPageLayout()
        showMainPageMenu()
        $('#mainPage .menu').addClass('projects').removeClass('contact').removeClass('news')
        $('#projectsBody').fadeIn()
      },

      '/projects/:projectName': function() {

      }
    }
    var router = Router(routes)
    router.init()
    window.location.hash = window.location.hash || '#contact'

  }
})
