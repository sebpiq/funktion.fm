var _ = require('underscore')
  , shapes = require('../drawing-tools/shapes')
  , utils = require('../drawing-tools/utils')
  , context = require('../context')

module.exports = function() {
  var clusterSize = Math.floor(context.vertexCount / 3)
    , cluster1 = context.vertices.slice(0, clusterSize)
    , cluster2 = context.vertices.slice(clusterSize, 2 * clusterSize)
    , cluster3 = context.vertices.slice(2 * clusterSize)
    , core1, core2, core3
    , r1, r2, r3, rCollisionMargin = 10
    , contactBodyFontSize, textMenuFontSize
  _.forEach(context.vertices, function(v) { v.perturbation = 0.3 })

  // Landscape layout
  if (context.width > context.height) {
    core1 = [context.width/10, context.height/13]
    core2 = [0.65 * context.width, 4 * context.height/5]
    core3 = [7 * context.width/8, context.height/7]
    r1 = context.height/1.5
    r2 = context.height/3
    r3 = context.height/3
  
  // Portrait layout
  } else {
    core1 = [1.2 * context.width/5, context.height/13]
    core2 = [0.2 * context.width, 4 * context.height/5]
    core3 = [7 * context.width/8, 0.6 * context.height]
    r1 = context.width/1.5
    r2 = context.width/3
    r3 = context.width/3
  }

  // Solve collisions
  while (utils.distance(core1, core3) < (r1 + r3 + rCollisionMargin)) {
    core1[0] *= 0.99
    core3[1] *= 1.01
    r1 *= 0.99; r2 *= 0.99; r3 *= 0.99
  }

  while (utils.distance(core1, core2) < (r1 + r2 + rCollisionMargin)) {
    core2[0] *= 0.99; core2[1] *= 1.01
    core1[1] *= 0.99
    r1 *= 0.99; r2 *= 0.99; r3 *= 0.99
  }

  // Size menu items and titles
  // We size menu items in reference to "projects" which is the longest item
  // For title, we need to calculate the size taking into account that part of the flower is outside
  // the viewport. So we take into acccount `core1`
  textMenuFontSize = r3 / $('.menuItem.projectsText').width() * 0.85 * 100
  textMenuFontSize = Math.min(textMenuFontSize, 220)
  $('svg text.menuItem').css('font-size', '' + textMenuFontSize + '%')
  // !!! we need to show and hide so elements have sizes and we can do calculations
  $('#contactBody').show()
  contactBodyFontSize = ((core1[0] + r1 * 0.5) / $('#contactBody .title').width() * 0.85 * 100)
  contactBodyFontSize = Math.min(contactBodyFontSize, 120)
  $('#contactBody').css('font-size', '' + contactBodyFontSize + '%')
  $('#contactBody').hide()

  // (vertices, core, r, randomize)
  shapes.makeFlower(cluster1, core1, r1, 0.1)
  shapes.makeFlower(cluster2, core2, r2, 0.1)
  shapes.makeFlower(cluster3, core3, r3, 0.1)

  return [core1, core2, core3]
}