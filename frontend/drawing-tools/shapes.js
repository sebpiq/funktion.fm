// These are just functions which organize vertices in different shapes
// and apply colors to them.
var _ = require('underscore')
  , context = require('../context')
  , utils = require('./utils')

// Function to make appear flower petals from the tesselation
module.exports.makeFlower = function(vertices, core, r, randomize) {
  var debugColor = utils.getRandomColor()
    , polygons, corePath
    , isPetal
    , teta, j

  vertices[0].transitionTo(core)
  vertices[0].style = {fill: 'white', 'fill-opacity': 1}
    
  // Move the vertices around the core on `r` and randomized.
  _.forEach(vertices.slice(1), function(vertex, i) {
    teta = i * 2 * Math.PI / vertices.length
    vertex.transitionTo([
      core[0] + r * Math.cos(teta) * (1 - randomize + Math.random() * randomize * 2),
      core[1] + r * Math.sin(teta) * (1 - randomize + Math.random() * randomize * 2)
    ])

    vertex.debugColor = debugColor
  })

  // Generate the tesselation paths for the gravity centers of all vertices
  polygons = context.voronoi.polygons(_.pluck(vertices, 'ideal'))

  // Find all paths that have a common edge with the core, and make them a petal
  corePath = polygons[0]
  j = 0
  _.forEach(polygons.slice(1), function(path, i) {
    isPetal = utils.intersects(path, corePath)
    if (isPetal) {
      vertices[i + 1].style = {
        fill: ['#F7C24C', '#F7C85E', '#F5B935', '#F5B335', '#F7C25E'][j++ % 5],
        'fill-opacity': 0.9
      }
    } else {
      var c = Math.round(20 + (Math.random() * 2 - 1) * 5)
      vertices[i + 1].style = {
        fill: utils.rgbToHex(c, c, c),
        'fill-opacity': 0.9
      }
    }
  })
}

module.exports.makeSpiral = function(vertices, opts, forEach) {
  _.defaults(opts, {
    computeTeta: function(rand, context) { return context.teta + rand },
    computeR: function(rand, context) { return context.r + rand },
    slices: 10
  })
  var core = opts.core
    , teta, r, x, y
    , context = { teta: 0, r: 0 }
    , debugColor = utils.getRandomColor()

  // Move the vertices around the core in a spiral.
  _.forEach(vertices, function(vertex, i) {
    teta = opts.computeTeta(utils.randTolerance(opts.randomize), context)
    r = opts.computeR(utils.randTolerance(opts.randomize), context)

    x = core[0] + r * Math.cos(teta)
    y = core[1] + r * Math.sin(teta)
    vertex.transitionTo([x, y])

    if (forEach) forEach(vertex, i, r, teta)
    context.teta += 2 * Math.PI / opts.slices
    context.r += opts.rStep

    vertex.debugColor = debugColor
  })
}

module.exports.makePolygon = function(vertices, opts, forEach) {
  var polygon = opts.polygon
    , nCols = polygon[1].length
    , nRows = polygon[0].length
    , col = 0, row = 0
    , x, y, xRange, yRange
    , debugColor = utils.getRandomColor()

  _.defaults(opts, {randX: 0, randY: 0})

  _.forEach(vertices, function(vertex) {
    xRange = polygon[0][row]
    yRange = polygon[1][col]
    x = xRange[0] + col/(nCols - 1) * (xRange[1] - xRange[0])
    y = yRange[0] + row/(nRows - 1) * (yRange[1] - yRange[0])
    vertex.transitionTo([
      x + (Math.random() * 2 - 1) * opts.randX,
      y + (Math.random() * 2 - 1) * opts.randY
    ])
    if (forEach) forEach(vertex, row, col)
    col = (col + 1) % nCols
    if (col === 0) row++
    vertex.debugColor = debugColor
  })
}