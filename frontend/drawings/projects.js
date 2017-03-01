var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')

module.exports = function() {
  var gradient = utils.makeGradient([10, 10, 10], [23, 35, 35])

  shapes.makePolygon(context.vertices, {
    polygon: [
      _.range(context.vertices.length / 2).map(function(i) {
        var x = i / (context.vertices.length / 2) * context.width
        return [x, x]
      }),
      [[context.height / 5, context.height / 5], [1.5 * context.height / 5, 1.5 * context.height / 5]]
    ]
  }, function(vertex, row, col) {
    vertex.perturbation = 0.05
    vertex.style = {fill: gradient(Math.random()), 'fill-opacity': 1}
  })
}