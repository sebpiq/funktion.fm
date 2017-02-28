var $ = require('jquery')
  , d3 = require('d3-selection')
  , _ = require('underscore')
d3.voronoi = require('d3-voronoi').voronoi

// Debugging tessellations, also shows vertices. `true` or `false`.
exports.debugTessellations = false

// Duration of transition between 2 drawings, in milliseconds.
exports.transitionTime = 800

// Interval between 2 steps of the animation, in milliseconds.
exports.animateInterval = 1000 / 60

// Number of vertices
exports.vertexCount = 180

// How the vertices are initially layed-out.
exports.initialVertices = {cols: 10, rows: 18}


// Dimensions
exports.width = $(window).width()
exports.height = $(window).height()
// We add some pixels to the bounds to allow the Voronoi to work properly.
exports.bounds = [ [-1000, -1000], [exports.width + 1000, exports.height + 1000] ]

// d3 svg element
exports.svg = d3.select('#bgSvg')
  .attr('width', exports.width)
  .attr('height', exports.height)
  .attr('class', 'PiYG')

// All vertices currently managed in the page
exports.vertices = []

// true if the current browser is a mobile browser
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
  exports.isMobile = true
else 
  exports.isMobile = true//false

// Voronoi layout to use throughout the application
exports.voronoi = d3.voronoi()
exports.voronoi.extent(exports.bounds)