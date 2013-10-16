var width = $(window).width(), height = $(window).height(), lineHeight = 20
  , i, allVertices = [], clusters = []
  , tessCount = 60
  , transitionTime = 1500
  , winSize = 10
  , debugTesselations = false
  , r = height/30
  , cluster1, cluster2, cluster3
  , projectsText, newsText, contactText

// d3 variables
var svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'PiYG')
  , path = svg.append('g').selectAll('path')

var Cluster = function(opts) {
  _.extend(this, opts)
  this.vertices = []
  this.state = 'collapsed'
  this.gravity = 10
  this.perturbation = 0.01
  clusters.push(this)

  // Generate a random-ish points :
  // 1) take points evenly distributed on a disc
  // 2) randomize a bit
  var x, y, vertex, teta
  for (i = 0; i < tessCount; i++) {
    teta = i * 2 * Math.PI / tessCount
    x = this.core[0] + r * Math.cos(teta)
    y = this.core[1] + r * Math.sin(teta)
    vertex = []
    vertex.gravityCenter = [x, y]
    
    // Randomized x and y
    x = (Math.random() * 2 - 1) * width/(1 * tessCount) + x
    y = (Math.random() * 2 - 1) * height/(1 * tessCount) + y
    vertex[0] = x
    vertex[1] = y
    
    // Extra, for animation and display
    vertex.vx = []
    vertex.vy = []
    vertex.cluster = this

    allVertices.push(vertex)
    this.vertices.push(vertex)
  }
}

_.extend(Cluster.prototype, {

  expand: function() {
    var self = this
    if (this.state !== 'expanded') {
      this._expand()
      this.state = 'expanded'
      _.forEach(clusters, function(cluster) {
        if (cluster !== self) cluster.state = 'collapsed'
      })
    }
  },

  // Calculate the position of vertices for the next frame in the animation
  nextFrame: function() {
    var self = this
      , x, y, xDist, yDist
    this.vertices.forEach(function(v, i) {
      xDist = v.gravityCenter[0] - v[0]
      yDist = v.gravityCenter[1] - v[1]
      v.vx.push(Math.random() * xDist / self.gravity + (Math.random() * 2 - 1) * self.perturbation)
      v.vy.push(Math.random() * yDist / self.gravity + (Math.random() * 2 - 1) * self.perturbation)

      // to smooth out, we compute the average from last positions
      if (v.vy.length > winSize) v.vy.shift()
      if (v.vx.length > winSize) v.vx.shift()
      v[0] = v[0] + avg(v.vx)
      v[1] = v[1] + avg(v.vy)
    })
  },

  // Function to make appear flower petals from the tesselation
  makeFlower: function(core, r, randomize) {
    this.core = core
    var self = this
      , paths, corePath
      , isPetal
      , teta, j

    this.vertices[0].gravityCenter = core
    this.vertices[0].style = {fill: 'white', 'fill-opacity': 1}

    // 'while' is because sometimes voronoi fails : https://github.com/mbostock/d3/issues/1578
    while(true) {
      
      // Move the vertices around the core on `r` and randomized.
      _.forEach(this.vertices.slice(1), function(vertex, i) {
        teta = i * 2 * Math.PI / tessCount
        vertex.gravityCenter = [
          self.core[0] + r * Math.cos(teta) * (1 - randomize + Math.random() * randomize * 2),
          self.core[1] + r * Math.sin(teta) * (1 - randomize + Math.random() * randomize * 2)
        ]
      })

      // Generate the tesselation paths for the gravity centers of all vertices 
      try {
        paths = d3.geom.voronoi(_.pluck(this.vertices, 'gravityCenter'))
        break
      } catch (err) {
        console.warn(err)
      }
    }

    // Find all paths that have a common edge with the core, and make them a petal
    corePath = paths[0]
    j = 0
    _.forEach(paths.slice(1), function(path, i) {
      isPetal = intersects(path, corePath)
      if (isPetal) {
        self.vertices[i + 1].style = {
          fill: ['#F7C24C', '#F7C85E', '#F5B935', '#F5B335', '#F7C25E'][j++ % 5],
          'fill-opacity': 0.9
        }
      } else {
        var c = Math.round(20 + (Math.random() * 2 - 1) * 5)
        console.log(rgbToHex(c, c, c))
        self.vertices[i + 1].style = {
          fill: rgbToHex(c, c, c),
          'fill-opacity': 0.9
        }
      }
    })
  },

  makeSpiral: function(opts, forEach) {
    _.defaults(opts, {
      radiusFnOfTeta: function(teta) { return 1 },
      slices: 10,
      vertices: this.vertices
    })
    this.core = opts.core
    var self = this
      , teta, r, x, y

    // Move the vertices around the core in a spiral.
    _.forEach(opts.vertices, function(vertex, i) {
      teta = (i + Math.random() * opts.randomize * 2 - opts.randomize) * 2 * Math.PI / opts.slices
      r = (i + Math.random() * opts.randomize * 2 - opts.randomize) * opts.rStep * opts.radiusFnOfTeta(teta)
      x = self.core[0] + r * Math.cos(teta)
      y = self.core[1] + r * Math.sin(teta)
      vertex.gravityCenter = [x, y]
      if (forEach) forEach(vertex, i, r, teta)
    })
  },

  makePolygon: function(opts, forEach) {
    var polygon = opts.polygon
      , nCols = polygon[1].length
      , nRows = polygon[0].length
      , col = 0, row = 0
      , x, y, xRange, yRange
    _.defaults(opts, {randX: 0, randY: 0, vertices: this.vertices})

    _.forEach(opts.vertices, function(vertex) {
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
    })
  }

})

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

cluster1 = new Cluster({ core: [width/8, height/7] })
cluster2 = new Cluster({ core: [0.5 * width, 2 * height/5] })
cluster3 = new Cluster({ core: [7 * width/8, height/7] })

projectsText = createText('PROJECTS', 'projectsText')
projectsText.on('click', function() { cluster3.expand() })
newsText = createText('NEWS', 'newsText')
newsText.on('click', function() { cluster2.expand() })
contactText = createText('funktion.fm', 'contactText')
contactText.on('click', function() { cluster1.expand() })

cluster2._expand = function() {
  window.location.hash = 'news'

  _.forEach(clusters, function(cluster) {
    cluster.perturbation = 0.5
  })

  projectsText.classed({hidden: false})
  contactText.classed({hidden: false})
  newsText.classed({hidden: false})

  contactText.moveToPosition([0.01* width, 0.1 * height])
  newsText.moveToPosition([0.01* width, 0.3 * height])
  projectsText.moveToPosition([0.01* width, 0.5 * height])

  svg.selectAll('text').transition().attr('fill', 'white')

  var sunGradient = makeGradient([247, 194, 76], [255, 255, 255])
  cluster3.makeSpiral({
    core: [0.93*width, 0.1*height],
    randomize: 0,
    rStep: width/930,
    slices: 10,
    radiusFnOfTeta: function(teta) {
      return 2 + Math.cos(2 * teta + Math.PI) / 1
    }
  }, function(vertex, i) {
    vertex.style = {fill: sunGradient(i / tessCount), 'fill-opacity': 1}
  })

  var stoneGradient = gradient = makeGradient([0, 0, 0], [100, 100, 100])
  cluster1.makePolygon({
    polygon: [
      _.range(6).map(function(i) { return [0, 0.1*width + (6 - i + 1)/6 * 0.2*width] }),
      _.range(10).map(function() { return [0.1*height, 0.6*height] })
    ],
    randX: 5, randY: 20
  }, function(vertex, row, col) {
    if (col === 10 - 1) vertex.style = {fill: 'white', 'fill-opacity': 1}
    else vertex.style = {fill: stoneGradient(col/10), 'fill-opacity': 0.9}
  })
  cluster1.perturbation = 0

  var seaGradient = makeGradient([255, 255, 255], [60, 60, 75])
  cluster2.makePolygon({
    polygon: [
      _.range(10).map(function(i) { return [width/12, 11*width/12] }),
      _.range(6).map(function() { return [3 * height/4, height] })    
    ]
  }, function(vertex, row, col) {
    vertex.style = {
      fill: seaGradient((row === 0) ? 0 : Math.pow(1.35, row) / Math.pow(1.35, 10 - 1)),
      'fill-opacity': 1
    }
  })
  cluster2.perturbation = 0.25

  $('#newsBody').slideDown()
  $('#contactBody').fadeOut()
}

cluster3._expand = function() {

  window.location.hash = 'projects'

  projectsText.classed({hidden: false})
  contactText.classed({hidden: false})
  newsText.classed({hidden: false})

  projectsText.transition().attr({fill: 'white'}).duration(transitionTime)
  contactText.transition().attr({fill: 'black'}).duration(transitionTime)
  newsText.transition().attr({fill: 'white'}).duration(transitionTime)

  contactText.moveToPosition([0.01* width, 0.1 * height])
  newsText.moveToPosition([0.01* width, 0.3 * height])
  projectsText.moveToPosition([0.01* width, 0.5 * height])

  var cloudGradient = makeGradient([255, 255, 255], [150, 150, 150])
    , gradientCloudMountain = makeGradient([150, 150, 150], [83, 102, 83])

  cluster1.makeSpiral({
    vertices: cluster1.vertices.concat(cluster3.vertices),
    core: [0.8*width, 0.1*height],
    randomize: 0.3,
    rStep: width/800,
    slices: 10,
    radiusFnOfTeta: function(teta) {
      return 1 + Math.abs(Math.cos(teta))
    }
  }, function(vertex, i, r, teta) {
    teta = (teta % (2*Math.PI))
    if (Math.PI*0.2 < teta && teta < Math.PI*0.8)
      vertex.style = {fill: gradientCloudMountain(i / (2*tessCount)), 'fill-opacity': 1}
    else if (Math.PI < teta && teta < 2*Math.PI)
      vertex.style = {fill: cloudGradient(0.5 * 1 - i / (2*tessCount)), 'fill-opacity': 1}
    else
      vertex.style = {fill: cloudGradient(0.5 + 0.5 * i / (2*tessCount)), 'fill-opacity': 1}
  })
  cluster3.perturbation = 0.4
  

  var treeWidth = width/25
    , forrestOffset = width/6
    , treeByRow = 10, forestRows = 3, row = 0
    , treeBase = 0.92 * height
    , treeHeight = 0.03 * height
    , treeCount = 0
    , randX, randY
    // each row has one less tree than the previous, and there is an extra last raw to shape the forrest
    , finalTreeCount = _.reduce(_.range(forestRows+1), function(total, row) { return total + treeByRow - row }, 0)

  _.forEach(cluster2.vertices.slice(0, finalTreeCount), function(vertex, i) {
    if (row < forestRows) {
      randX = (Math.random() * 2 - 1) * 10
      randY = (Math.random() * 2 - 1) * 10
      vertex.style = {
        fill: ['#364729', '#2C3624', '#1B2E0D', '#254125', '#213121', '#0C2A0C'][Math.floor(Math.random() * 6)],
        stroke: ['#364729', '#2C3624', '#1B2E0D', '#254125', '#213121', '#0C2A0C'][Math.floor(Math.random() * 6)]
      }
    } else {
      randX = 0
      randY = 0
      vertex.style = { fill: '#536653' }
    }
    vertex.gravityCenter = [
      forrestOffset + (i-treeCount + 0.5*row) * treeWidth + randX,
      treeBase - row * treeHeight + randY
    ]
    //} else vertex.gravityCenter = [0, 0]
    if ((i+1-treeCount) % treeByRow === 0) {
      row++
      treeCount += treeByRow
      treeByRow--
    }
  })
  cluster2.perturbation = 0.05

  var fogCenter = 0.5*width
    , moutainSlope = 0.05*width
  cluster2.makePolygon({
    polygon: [
      _.map(_.range(13), function(i) { return [fogCenter, fogCenter+width/1200] }),
      _.map(_.range(2), function(i) { return [0.05*height + i*0.008*width, 0.3*height + i*0.008*width] })
    ],
    vertices: cluster2.vertices.slice(finalTreeCount),
    randX: 5
  }, function(vertex, row, col) {
    vertex.style = {fill: cloudGradient(row/13)}
  })
  
  $('#newsBody').slideUp()
  $('#contactBody').fadeOut()
  
}

cluster1._expand = function() {
  window.location.hash = 'contact'

  _.forEach(clusters, function(cluster) {
    cluster.perturbation = 0.3
  })
  cluster1.makeFlower([width/10, height/15], 600, 0.1)  
  cluster2.makeFlower([0.8 * width, 4 * height/5], 200, 0.1)
  cluster3.makeFlower([7 * width/8, height/7], 200, 0.1)

  contactText.classed({hidden: true})
  newsText.classed({hidden: false})
  projectsText.classed({hidden: false})

  newsText.moveToPosition([cluster2.core[0] - newsText.text().length * 9, cluster2.core[1] + 7])
  projectsText.moveToPosition([cluster3.core[0] - projectsText.text().length * 9, cluster3.core[1] + 7])

  svg.selectAll('text').transition().attr('fill', 'black')

  $('#newsBody').slideUp()
  $('#contactBody').fadeIn()
}

$(function() {

  $('.postTitle a').click(function(event) {
    event.preventDefault()
    $.get($(this).attr('href'), function(postHtml) {
      $('newsBody').css('height', '100%')
      $('#postViewer')
        .html(postHtml)
        .slideDown()
      $('#newsContainer').fadeOut()
      $('#newsTitle').fadeOut()
    })
  })
})

// ---------- MISC ---------- //

// Calculate Voronoi tesselation
var calculateTesselation = function() {
  return d3.geom.voronoi(allVertices).map(function(d, i) {
    return { d: 'M' + d.join('L') + 'Z' }
  })
}

// Draw tesselation
var drawTesselations = function() {
  if (debugTesselations) {
    svg.selectAll('circle').data(allVertices).enter().append('circle')
      .attr('r', function (d) { return 5 })
      .attr('fill', function(d) {
      switch (d.cluster){
        case cluster2:
          return 'red'
          break
        case cluster1:
          return 'blue'
          break
        case cluster3:
          return 'green'
          break
      }
    })
    svg.selectAll('circle').data(allVertices)
      .attr('cx', function (d) { return d[0] })
      .attr('cy', function (d) { return d[1] })
  }

  path = path.data(calculateTesselation())
  path.exit().remove()
  path.enter()
    .append('path')
  path
    .attr('d', function(d) { return String(d.d) })
    .each(function(d, i) {
      var self = this
      if (allVertices[i].style) {
        var transition = d3.select(self).transition()

        if (allVertices[i].style.fill && !allVertices[i].style.stroke)
          allVertices[i].style.stroke = allVertices[i].style.fill

        _.chain(allVertices[i].style).pairs().forEach(function(pair) {
          var propName = pair[0]
            , propValue = pair[1]
          transition.attr(propName, propValue)
        }).value()
        transition.duration(transitionTime)
        delete allVertices[i].style
      }
    })
  path.order()
}

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

// Animate the thing
drawTesselations()
setInterval(function() {
  clusters.forEach(function(cluster) { cluster.nextFrame() })
  drawTesselations()
}, 20)

$(function() {
  switch (window.location.hash) {
    case '#news':
      cluster2.expand()
      break
    case '#contact':
      cluster1.expand()
      break
    case '#projects':
      cluster3.expand()
      break
  }

})
