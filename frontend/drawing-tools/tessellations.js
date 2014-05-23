var _ = require('underscore')
  , config = require('../config')
  , context = require('../context')

// Calculate Voronoi tesselation
var calculate = function() {
  return d3.geom.voronoi(context.vertices).map(function(d, i) {
    return { d: 'M' + d.join('L') + 'Z' }
  })
}

// Draw tesselation
module.exports.draw = function() {
  if (config.debugTesselations) {
    context.svg.selectAll('circle').data(context.vertices).enter().append('circle')
      .attr('r', function (d) { return 5 })
    context.svg.selectAll('circle').data(context.vertices)
      .attr('cx', function (d) { return d[0] })
      .attr('cy', function (d) { return d[1] })
      .attr('fill', function(d) { return d.debugColor })
  }

  context.path = context.path.data(calculate())
  context.path.exit().remove()
  context.path.enter().append('path')
  context.path.attr('d', function(d) { return String(d.d) })
    .each(function(d, i) {
      var self = this

      // TODO: Doesn't really belong here
      // If there's a style defined on the vertices, we apply a transition
      // to the calculated paths.
      if (context.vertices[i].style) {
        var transition = d3.select(self).transition()

        if (context.vertices[i].style.fill && !context.vertices[i].style.stroke)
          context.vertices[i].style.stroke = context.vertices[i].style.fill

        _.chain(context.vertices[i].style).pairs().forEach(function(pair) {
          var propName = pair[0]
            , propValue = pair[1]
          transition.attr(propName, propValue)
        }).value()
        transition.duration(config.transitionTime)
        delete context.vertices[i].style
      }

    })
  context.path.order()
}