// Module to handle animations of the vertices positions,
// transitions between one drawing and another, but also gravitation.
// The actual calculations for each frame are handled by the vertices themselves.
// This module is just handling timing and rendering.

var _ = require('underscore')
  , d3 = require('d3-selection')
  , context = require('../context')
  , polygonGroup = context.svg.append('g')
  , transitionStartTime = 0
  , rafHandle = null // handle to cancel an animation frame

exports.startTransition = function() {
  if (rafHandle) cancelAnimationFrame(rafHandle)
  transitionStartTime = +(new Date)
  rafHandle = requestAnimationFrame(transitionFrame)
}

// Should be called with `progress` during a transition. `progress` is a number
// between 0 and 1.
var redraw = function(progress) {
  _.forEach(context.vertices, function(v) { v.nextFrame(progress) })
  drawTessellations()
}

var transitionFrame = function() {
  var progress = Math.min((+(new Date) - transitionStartTime) / context.transitionTime, 1)
  redraw(progress)
  if (progress < 1)
    rafHandle = requestAnimationFrame(transitionFrame)
  // If the browser is desktop, we continue animating even when the transition is over
  else if (!context.isMobile)
    rafHandle = requestAnimationFrame(redrawLoop)
}

var redrawLoop = function() {
  redraw()
  rafHandle = requestAnimationFrame(redrawLoop)
}

var drawTessellations = function() {
  if (context.debugTessellations) {
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