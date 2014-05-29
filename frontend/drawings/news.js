var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')
  , config = require('../config')

module.exports = function() {

  var clusterSize = Math.floor(config.vertexCount / 3)
    , cluster1 = context.vertices.slice(0, clusterSize)
    , cluster2 = context.vertices.slice(clusterSize, 2 * clusterSize)
    , cluster3 = context.vertices.slice(2 * clusterSize)
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

  var stoneGradient = gradient = utils.makeGradient([0, 0, 0], [150, 150, 150])
  shapes.makePolygon(cluster2, {
    polygon: [
      _.range(6).map(function(i) { return [0, 0.2*context.width + Math.pow(i - 2.5, 2) * 0.008*context.width] }),
      _.range(10).map(function() { return [0.1*context.height, 0.6*context.height] })
    ],
    randX: 10, randY: 20
  }, function(vertex, row, col) {
    if (col === 10 - 1) vertex.style = {fill: 'white', 'fill-opacity': 1}
    else vertex.style = {fill: stoneGradient(col/10), 'fill-opacity': 0.9}
  })
  _.forEach(cluster2, function(v) { v.perturbation = 0 })
  // Make sure that there is not a stone spike that covers the news text
  cluster2[9].gravityCenter[1] = cluster2[8].gravityCenter[1]
  cluster2[59].gravityCenter[1] = cluster2[58].gravityCenter[1]

  var seaGradient = utils.makeGradient([255, 255, 255], [60, 60, 75])
  shapes.makePolygon(cluster3, {
    polygon: [
      _.range(10).map(function(i) { return [context.width/12, 11*context.width/12] }),
      _.range(6).map(function() { return [3 * context.height/4, context.height] })    
    ]
  }, function(vertex, row, col) {
    vertex.style = {
      fill: seaGradient((row === 0) ? 0 : Math.pow(1.35, row) / Math.pow(1.35, 10 - 1)),
      'fill-opacity': 1
    }
  })
  _.forEach(cluster3, function(v) { v.perturbation = 0.25 })
}