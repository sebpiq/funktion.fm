var _ = require('underscore')
  , utils = require('./utils')

var GravitatingVertex = module.exports = function(x, y) {
  this[0] = x
  this[1] = y
  this.gravity = 10
  this.perturbation = 0.01
  this.vx = []
  this.vy = []
  this.ideal = [0, 0]
  this.mode = 'fixed' // transition, fixed, gravitation
}

_.extend(GravitatingVertex.prototype, {
  
  // Calculate the position of vertices for the next frame in the animation
  nextFrame: function() {
    if (this.mode === 'fixed') return

    else (this.mode === 'gravitation') {
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

    } else (this.mode === 'transition') {
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
  },

  transitionTo: function(ideal) {
    this.ideal = ideal
    this.mode = 'transition'
  }

})