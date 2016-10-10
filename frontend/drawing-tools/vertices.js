var _ = require('underscore')
  , utils = require('./utils')
  , context = require('../context')

// Base class for vertices. Provides convenience to animate vertices.
// In this base class, the vertex does nothing when idle (outside of a transition).
var Vertex = exports.Vertex = function(x, y) {
  this[0] = x
  this[1] = y
  this.ideal = [0, 0]
  this.transition = null
  this.polygon = null
}

_.extend(Vertex.prototype, {
  
  // Starts a transition, moving the vertex to `target`
  transitionTo: function(target) {
    var numSteps = Math.round(context.transitionTime / context.animateInterval)
    this.ideal = target

    this.transition = {
      origin: [this[0], this[1]]
    }
  },

  // Calculate the position of the vertex for the next frame in the animation
  nextFrame: function(progress) {
    if (this.transition) this._nextTransitionFrame(progress)
    else this._nextFrame()
  },

  // Calculate the next position of the vertex when vertex is idle.
  _nextFrame: function() {},

  // Calculate the next position of the vertex according to the ongoing transition
  _nextTransitionFrame: function(progress) {
    if (_.isNumber(progress) && progress < 1) {
      this[0] = this.transition.origin[0] + (this.ideal[0] - this.transition.origin[0]) * progress
      this[1] = this.transition.origin[1] + (this.ideal[1] - this.transition.origin[1]) * progress
    } else {
      this.transition = null
      this[0] = this.ideal[0]
      this[1] = this.ideal[1]
    }
  }

})

// Subclass of Vertex adding an animation when the vertex is idle.
var GravitatingVertex = exports.GravitatingVertex = function(x, y) {
  Vertex.apply(this, arguments)

  this.gravity = 10
  this.perturbation = 0.01
  this.vx = []
  this.vy = []
}

_.extend(GravitatingVertex.prototype, Vertex.prototype, {
  
  // Calculate the position of vertices for the next frame in the animation
  _nextFrame: function() {
    if (this.perturbation === 0) return
    
    var x, y, xDist, yDist
    xDist = this.ideal[0] - this[0]
    yDist = this.ideal[1] - this[1]
    this.vx.push(Math.random() * xDist / this.gravity + utils.randTolerance(this.perturbation))
    this.vy.push(Math.random() * yDist / this.gravity + utils.randTolerance(this.perturbation))

    // to smooth out, we compute the average from last positions
    if (this.vy.length > 10) this.vy.shift()
    if (this.vx.length > 10) this.vx.shift()
    this[0] = this[0] + utils.avg(this.vx)
    this[1] = this[1] + utils.avg(this.vy)
  }

})