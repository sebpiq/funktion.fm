// Function to make appear flower petals from the tesselation
var makeFlower = function(vertices, core, r, randomize) {
  var debugColor = getRandomColor()
    , paths, corePath
    , isPetal
    , teta, j

  vertices[0].gravityCenter = core
  vertices[0].style = {fill: 'white', 'fill-opacity': 1}
    
  // Move the vertices around the core on `r` and randomized.
  _.forEach(vertices.slice(1), function(vertex, i) {
    teta = i * 2 * Math.PI / tessCount
    vertex.gravityCenter = [
      core[0] + r * Math.cos(teta) * (1 - randomize + Math.random() * randomize * 2),
      core[1] + r * Math.sin(teta) * (1 - randomize + Math.random() * randomize * 2)
    ]

    vertex.debugColor = debugColor
  })

  // Generate the tesselation paths for the gravity centers of all vertices 
  paths = d3.geom.voronoi(_.pluck(vertices, 'gravityCenter'))

  // Find all paths that have a common edge with the core, and make them a petal
  corePath = paths[0]
  j = 0
  _.forEach(paths.slice(1), function(path, i) {
    isPetal = intersects(path, corePath)
    if (isPetal) {
      vertices[i + 1].style = {
        fill: ['#F7C24C', '#F7C85E', '#F5B935', '#F5B335', '#F7C25E'][j++ % 5],
        'fill-opacity': 0.9
      }
    } else {
      var c = Math.round(20 + (Math.random() * 2 - 1) * 5)
      vertices[i + 1].style = {
        fill: rgbToHex(c, c, c),
        'fill-opacity': 0.9
      }
    }
  })
}

var makeSpiral = function(vertices, opts, forEach) {
  _.defaults(opts, {
    computeTeta: function(rand, context) { return context.teta + rand },
    computeR: function(rand, context) { return context.r + rand },
    slices: 10
  })
  var core = opts.core
    , teta, r, x, y
    , context = { teta: 0, r: 0 }
    , debugColor = getRandomColor()

  // Move the vertices around the core in a spiral.
  _.forEach(vertices, function(vertex, i) {
    teta = opts.computeTeta(randTolerance(opts.randomize), context)
    r = opts.computeR(randTolerance(opts.randomize), context)

    x = core[0] + r * Math.cos(teta)
    y = core[1] + r * Math.sin(teta)
    vertex.gravityCenter = [x, y]

    if (forEach) forEach(vertex, i, r, teta)
    context.teta += 2 * Math.PI / opts.slices
    context.r += opts.rStep

    vertex.debugColor = debugColor
  })
}

var makePolygon = function(vertices, opts, forEach) {
  var polygon = opts.polygon
    , nCols = polygon[1].length
    , nRows = polygon[0].length
    , col = 0, row = 0
    , x, y, xRange, yRange
    , debugColor = getRandomColor()

  _.defaults(opts, {randX: 0, randY: 0})

  _.forEach(vertices, function(vertex) {
    xRange = polygon[0][row]
    yRange = polygon[1][col]
    x = xRange[0] + col/(nCols - 1) * (xRange[1] - xRange[0])
    y = yRange[0] + row/(nRows - 1) * (yRange[1] - yRange[0])
    vertex.gravityCenter = [
      x + (Math.random() * 2 - 1) * opts.randX,
      y + (Math.random() * 2 - 1) * opts.randY
    ]
    if (forEach) forEach(vertex, row, col)
    col = (col + 1) % nCols
    if (col === 0) row++
    vertex.debugColor = debugColor
  })
}


var createText = function(val, id) {
  var text = svg.append('text')
    .text(val)
    .attr('class', 'menuItem')
    .attr('id', id)

  text.moveToPosition = function(position) {
    this
      .attr('x', function(d) { return position[0] })
      .attr('y', function(d) { return position[1] })
  }

  return text
}

var Vertex = function(x, y) {
  this[0] = x
  this[1] = y
  this.gravity = 10
  this.perturbation = 0.01
  this.vx = []
  this.vy = []
  this.gravityCenter = [0, 0]
}

_.extend(Vertex.prototype, {
  
  // Calculate the position of vertices for the next frame in the animation
  nextFrame: function() {
    var x, y, xDist, yDist
    xDist = this.gravityCenter[0] - this[0]
    yDist = this.gravityCenter[1] - this[1]
    this.vx.push(Math.random() * xDist / this.gravity + randTolerance(this.perturbation))
    this.vy.push(Math.random() * yDist / this.gravity + randTolerance(this.perturbation))

    // to smooth out, we compute the average from last positions
    if (this.vy.length > winSize) this.vy.shift()
    if (this.vx.length > winSize) this.vx.shift()
    this[0] = this[0] + avg(this.vx)
    this[1] = this[1] + avg(this.vy)
  }

})


// Helpers
var distance = function(a, b) {
  return Math.pow(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2), 0.5)
}

var avg = function(array) {
  return _.reduce(array, function(tot, val) { return tot + val }, 0) / array.length
}

var sign = function (x) { return x > 0 ? 1 : x < 0 ? -1 : 0 }

// Finds if two path of the tesselation are adjacent
var intersects = function(path1, path2) {
  return _.any(path1, function(vertex1) {
    return _.any(path2, function(vertex2) {
      return _.isEqual(vertex1, vertex2)
    })
  })
}

var boundingBox = function(vertices) {
  var xVals = _.pluck(vertices, 0)
    , yVals = _.pluck(vertices, 1)
    , xMax = _.max(xVals)
    , xMin = _.min(xVals)
    , yMax = _.max(yVals)
    , yMin = _.min(yVals)
  return [[yMin, yMin], [xMax, yMax]]
}

// Random number in [-val, val]  
var randTolerance = function(val) {
  return Math.random() * val * 2 - val
}

var componentToHex = function(c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

var rgbToHex = function (r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

var makeGradient = function(col1, col2) {
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

var getRandomColor = function() {
  return rgbToHex(Math.round(255 * Math.random()), Math.round(255 * Math.random()), Math.round(255 * Math.random()))
}
