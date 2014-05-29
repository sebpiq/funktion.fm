var _ = require('underscore')
  , utils = require('./utils')
  , config = require('../config')

var Vertex = module.exports = function(x, y) {
  this[0] = x
  this[1] = y
  this.ideal = [0, 0]
  this.transition = null
}

_.extend(Vertex.prototype, {
  
  // Calculate the position of vertices for the next frame in the animation
  nextFrame: function(progress) {
    if (this.transition) {
      if (progress < 1) {
        this[0] = this.transition.origin[0] + (this.ideal[0] - this.transition.origin[0]) * progress
        this[1] = this.transition.origin[1] + (this.ideal[1] - this.transition.origin[1]) * progress
      } else {
        this.transition = null
        this[0] = this.ideal[0]
        this[1] = this.ideal[1]
      }
    }
  },

  transitionTo: function(target) {
    var numSteps = Math.round(config.transitionTime / config.animateInterval)
    this.ideal = target

    this.transition = {
      origin: [this[0], this[1]]
    }

  }

})