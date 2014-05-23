var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')
  , config = require('../config')

module.exports = function() {

  var cluster1 = context.vertices.slice(0, Math.floor(0.45 * config.vertexCount))  // foggy mountain
    , cluster2 = context.vertices.slice(cluster1.length, cluster1.length + Math.floor(0.38 * config.vertexCount)) // foggy moutain 2
    , cluster3 = context.vertices.slice(cluster1.length + cluster2.length) // fog1
    , cloudGradient = utils.makeGradient([255, 245, 160], [150, 150, 150])
    , gradientCloudMountain1 = utils.makeGradient([150, 150, 150], [83, 102, 83])
    , gradientCloudMountain2 = utils.makeGradient([150, 150, 150], [47, 94, 47])
    , fogCenter = 0.3*context.width

  // Foggy mountain1
  shapes.makeSpiral(cluster1, {
    core: [0.75*context.width, 0.1*context.height],
    randomize: 0.2,
    rStep: context.width/800,
    slices: 10,
    computeTeta: function(rand, context) {
      var teta = (context.teta % (2*Math.PI))
      if (Math.PI*0.9 < teta && teta < Math.PI*1.5) context.teta = Math.PI*1.5
      return rand + context.teta
    },
    computeR: function(rand, context) {
      return (rand + context.r) * (1 + Math.abs(Math.cos(context.teta)))
    }
  }, function(vertex, i, r, teta) {
    teta = (teta % (2*Math.PI))
    if (Math.PI*0.2 < teta && teta < Math.PI*0.8)
      vertex.style = {fill: gradientCloudMountain1(i / (2*cluster1.length)), 'fill-opacity': 1}
    else if (Math.PI < teta && teta < 2*Math.PI)
      vertex.style = {fill: cloudGradient(0.5 * 1 - i / (2*cluster1.length)), 'fill-opacity': 1}
    else
      vertex.style = {fill: cloudGradient(0.5 + 0.5 * i / (2*cluster1.length)), 'fill-opacity': 1}
  })
  _.forEach(cluster1, function(v) { v.perturbation = 0.1 })

  // Foggy mountain2
  shapes.makeSpiral(cluster2, {
    core: [0.3*context.width, 0.5*context.height],
    randomize: 0.2,
    rStep: context.width/800,
    slices: 13,
    computeTeta: function(rand, context) {
      var teta = (context.teta % (2*Math.PI))
      if ((Math.PI*0.9 < teta && teta < Math.PI*2)
        || teta < Math.PI*0.1) context.teta = Math.PI*0.1
      return rand + context.teta
    },
    computeR: function(rand, context) {
      return (rand + context.r) * (1 + Math.abs(Math.cos(context.teta)) * 3)
    }
  }, function(vertex, i, r, teta) {
    teta = (teta % (2*Math.PI))
    if ((Math.PI*0.2 < teta && teta < Math.PI*0.8)
      || (Math.PI*0.2 < teta && teta < Math.PI*0.85 && r > 0.2*context.width))
      vertex.style = {fill: gradientCloudMountain2(i / (2*cluster2.length)), 'fill-opacity': 1}
    else
      vertex.style = {fill: '#393f39', 'fill-opacity': 1}
  })
  _.forEach(cluster2, function(v) { v.perturbation = 0 })

  // Fog1
  shapes.makePolygon(cluster3, {
    polygon: [
      _.map(_.range(cluster3.length / 2), function(i) { return [fogCenter, fogCenter+context.width/1200] }),
      _.map(_.range(2), function(i) {
        return [
          0.05*context.height + i*0.008*context.width,
          0.3*context.height + i*0.008*context.width
        ]
      })
    ],
    randX: 5
  }, function(vertex, row, col) {
    vertex.style = {fill: cloudGradient(row/13), 'fill-opacity': 1}
  })
  _.forEach(cluster3, function(v) { v.perturbation = 0.02 })
}