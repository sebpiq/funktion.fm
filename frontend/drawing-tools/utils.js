var _ = require('underscore')
  , context = require('../context')

// Calculate Euclidian distance between vertex `a` and vertex `b`.
exports.distance = function(a, b) {
  return Math.pow(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2), 0.5)
}

// Calculate average value of `array` 
exports.avg = function(array) {
  return _.reduce(array, function(tot, val) { return tot + val }, 0) / array.length
}

// Returns `-1` if `x` negative, `1` if positive, `0` if zero. 
exports.sign = function (x) { return x > 0 ? 1 : x < 0 ? -1 : 0 }

// Returns true if `path1` and `path2` have at least one vertex in common.
exports.intersects = function(path1, path2) {
  return _.any(path1, function(vertex1) {
    return _.any(path2, function(vertex2) {
      return _.isEqual(vertex1, vertex2)
    })
  })
}

// Returns true if the vertex is out of the bounds of the drawing, false otherwise
exports.outOfBounds = function(vertex) {
  return (vertex[0] < context.bounds[0][0] || vertex[0] > context.bounds[1][0]
    || vertex[1] < context.bounds[0][1] || vertex[1] > context.bounds[1][1])
}

// Random number in [-val, val]  
exports.randTolerance = function(val) {
  return Math.random() * val * 2 - val
}

// Takes a HEX color component, number between 0 and 255, and returns the corresponding
// hexadecimal string
var componentToHex = exports.componentToHex = function(c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

// Takes three components `r` `g` `b` each between 0 and 255, and returns the corresponding
// HEX color string.
var rgbToHex = exports.rgbToHex = function (r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

// Helper to build a gradient between colors `col1` and `col2`.
// `col1` and `col2` are arrays `[<r>, <g>, <b>]`.
// The returned value is a function `gradient(index)`, where `index` is 
// value between 0 and 1, and which returns a HEX color string.
exports.makeGradient = function(col1, col2) {
  var steps = 255
    , j, gradient = []
  for (j = 0; j < steps; j++) {
    gradient.push(rgbToHex(
      Math.round(col1[0] + (col2[0] - col1[0]) * j / steps),
      Math.round(col1[1] + (col2[1] - col1[1]) * j / steps),
      Math.round(col1[2] + (col2[2] - col1[2]) * j / steps)
    ))
  }
  return function(ind) {
    return gradient[Math.floor(Math.min(Math.max(ind, 0), 0.99999) * steps)]
  }
}

// Returns a random hexadecimal color string
exports.getRandomColor = function() {
  return rgbToHex(Math.round(255 * Math.random()), Math.round(255 * Math.random()), Math.round(255 * Math.random()))
}
