var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')

module.exports = function() {

  var clusterSize = Math.floor(context.vertexCount / 3)
    , cluster1 = context.vertices.slice(0, clusterSize)
    , cluster2 = context.vertices.slice(clusterSize)
  _.forEach(context.vertices, function(v) { v.perturbation = 0.5 })

  context.svg.selectAll('text').transition().attr('fill', 'white')

  var sunGradient = utils.makeGradient([247, 194, 76], [255, 255, 255])
  shapes.makeSpiral(cluster1, {
    core: [0.93*context.width, 0.12*context.height],
    randomize: 0,
    rStep: context.width/930,
    slices: 10,
    computeR: function(rand, context) {
      return (context.r + rand) * (2 + Math.cos(2 * context.teta + Math.PI))
    }
  }, function(vertex, i) {
    vertex.style = {fill: sunGradient(i / clusterSize), 'fill-opacity': 1}
  })

  var seaGradient = utils.makeGradient([255, 255, 255], [60, 60, 75])
  shapes.makePolygon(cluster2, {
    polygon: [
      _.range(20).map(function(i) { return [context.width/12, 11*context.width/12] }),
      _.range(6).map(function() { return [context.height/2, context.height] })    
    ]
  }, function(vertex, row, col) {
    vertex.style = {
      fill: seaGradient((row === 0) ? 0 : Math.pow(1.17, row) / Math.pow(1.17, 20 - 1)),
      'fill-opacity': 1
    }
  })
  _.forEach(cluster2, function(v) { v.perturbation = 0.25 })
}