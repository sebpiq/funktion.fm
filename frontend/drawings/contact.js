var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , context = require('../context')

module.exports = function() {
  var clusterSize = Math.floor(context.vertexCount / 3)
    , cluster1 = context.vertices.slice(0, clusterSize)
    , cluster2 = context.vertices.slice(clusterSize, 2 * clusterSize)
    , cluster3 = context.vertices.slice(2 * clusterSize)
    , core1 = [context.width/10, context.height/15]
    , core2 = [0.8 * context.width, 4 * context.height/5]
    , core3 = [7 * context.width/8, context.height/7]

  _.forEach(context.vertices, function(v) { v.perturbation = 0.3 })
  shapes.makeFlower(cluster1, core1, context.width/2.2, 0.1)
  shapes.makeFlower(cluster2, core2, context.width/6.5, 0.1)
  shapes.makeFlower(cluster3, core3, context.width/6.5, 0.1)
  return [core1, core2, core3]
}