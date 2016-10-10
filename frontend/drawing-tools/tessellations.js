var _ = require('underscore')
  , d3 = require('d3')
  , context = require('../context')
  , polygonGroup = context.svg.append('g')

// Draw tesselation
module.exports.draw = function() {
  if (context.debugTesselations) {
    context.svg.selectAll('circle').data(context.vertices).enter().append('circle')
      .attr('r', function (d) { return 5 })
    context.svg.selectAll('circle').data(context.vertices)
      .attr('cx', function (d) { return d[0] })
      .attr('cy', function (d) { return d[1] })
      .attr('fill', function(d) { return d.debugColor })
  }

  _.forEach(context.voronoi.polygons(context.vertices), function(polygon, i) {
    context.vertices[i].polygon = polygon
  })
  var polygonPathsSelection = polygonGroup.selectAll('path').data(context.vertices)
  polygonPathsSelection.exit().remove()
  polygonPathsSelection.enter().append('path')
  // For each vertex, return its polygon
  // for some reason some polgon contain null points, so we filter them out.
  polygonPathsSelection.attr('d', function(d) {
      return d.polygon ? 'M' + _.filter(d.polygon, function(v) { return v }).join('L') + 'Z' : null 
    })
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
        transition.duration(context.transitionTime)
        delete context.vertices[i].style
      }
    })
    
  polygonPathsSelection.order()
}