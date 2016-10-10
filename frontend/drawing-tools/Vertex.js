var _ = require('underscore')
  , utils = require('./utils')
  , context = require('../context')

var Vertex = module.exports = function(x, y) {
  this[0] = x
  this[1] = y
  this.ideal = [0, 0]
  this.transition = null
  this.polygon = null
}

_.extend(Vertex.prototype, {
  
  // Calculate the position of vertices for the next frame in the animation
  nextFrame: function(progress) {
    if (this.transition) this._nextTransitionFrame(progress)
    else this._nextFrame()
  },

  _nextFrame: function() {},

  _nextTransitionFrame: function(progress) {
    if (_.isNumber(progress) && progress < 1) {
      this[0] = this.transition.origin[0] + (this.ideal[0] - this.transition.origin[0]) * progress
      this[1] = this.transition.origin[1] + (this.ideal[1] - this.transition.origin[1]) * progress
    } else {
      this.transition = null
      this[0] = this.ideal[0]
      this[1] = this.ideal[1]
    }
  },

  transitionTo: function(target) {
    var numSteps = Math.round(context.transitionTime / context.animateInterval)
    this.ideal = target

    this.transition = {
      origin: [this[0], this[1]]
    }

  }

})