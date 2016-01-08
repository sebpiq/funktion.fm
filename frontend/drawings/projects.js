var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')
  , config = require('../config')

module.exports = function() {

  /*
  var makeStar = function(core, cluster, rStep) {
    shapes.makeSpiral(cluster, {
      core: core,
      randomize: 0.3,
      rStep: context.width/500,
      slices: 13
    }, function(vertex, i, r, teta) {
      if (i < cluster.length * 0.8)
        vertex.style = {fill: starGradient(i / cluster.length), 'fill-opacity': 1}    
      else
        vertex.style = {fill: starGradient(1), 'fill-opacity': 1}
    })
    _.forEach(cluster, function(v) { v.perturbation = 1 })
  }

  var cluster1, cluster2, cluster3, cluster4
    , cum = 0
    , starGradient = utils.makeGradient([60, 60, 60], [30, 30, 30])

  cluster1 = context.vertices.slice(cum, cum + context.vertices.length / 4)
  cum += cluster1.length
  cluster2 = context.vertices.slice(cum, cum + context.vertices.length / 5)
  cum += cluster2.length
  cluster3 = context.vertices.slice(cum, cum + context.vertices.length / 5.5)
  cum += cluster3.length
  cluster4 = context.vertices.slice(cum)
  cum += cluster4.length

  makeStar([0.25*context.width, 0.1*context.height], cluster1)
  makeStar([0.1*context.width, 0.2*context.height], cluster2)
  makeStar([0.3*context.width, 0.5*context.height], cluster3)
  makeStar([0.4*context.width, 0.8*context.height], cluster4)
  */

  var gradient = utils.makeGradient([10, 10, 10], [0, 35, 35])

  shapes.makePolygon(context.vertices, {
    polygon: [
      _.range(context.vertices.length / 2).map(function(i) {
        var x = i / (context.vertices.length / 2) * context.width
        return [x, x]
      }),
      [[context.height / 5, context.height / 5], [1.5 * context.height / 5, 1.5 * context.height / 5]]
    ]
  }, function(vertex, row, col) {
    if (col == 0) {
      color = gradient(Math.random())
      vertex.perturbation = 0.05
    } else {
      color = gradient(Math.random())
      vertex.perturbation = 0.05
    }
    vertex.style = {fill: color, 'fill-opacity': 1}
  })
}