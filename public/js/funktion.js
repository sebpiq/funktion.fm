var width = $(window).width(), height = $(window).height(), lineHeight = 20
  , i, allVertices = [], clusters = []
  , tessCount = 60
  , winSize = 10
  , debugTesselations = false
  , r = height/30
  , contact, news, projects
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
    this.vertices[0].pathFill = 'white'

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
      if (isPetal) self.vertices[i + 1].pathFill = ['#F7C24C', '#F7C85E', '#F5B935', '#F5B335', '#F7C25E'][j++ % 5]
      else self.vertices[i + 1].pathFill = '#111'
    })
  },

  makeCloud: function(core, randomize, rStep, rStepExp) {
    this.core = core
    var self = this
      , teta, r, x, y
      , gradient = makeGradient([247, 194, 76], [255, 255, 255])

    // Move the vertices around the core in a spiral.
    _.forEach(this.vertices, function(vertex, i) {
      teta = (i + Math.random() * randomize * 2 - randomize) * 2 * Math.PI / 10
      r = (i + Math.random() * randomize * 2 - randomize) * Math.pow(rStep, rStepExp) * ((1 + Math.cos(2 * teta + Math.PI)) / 1 + 1)
      x = self.core[0] + r * Math.cos(teta)
      y = self.core[1] + r * Math.sin(teta)
      vertex.gravityCenter = [x, y]

      //c = Math.round(Math.pow(i / tessCount * Math.pow(255, 1/1.6), 1.6))
      vertex.pathFill = gradient(i / tessCount)//rgbToHex(c, c, c)
    })
  },

  makePolygon: function(opts, forEach) {
    var polygon = opts.polygon
      , nCols = polygon[1].length
      , nRows = polygon[0].length
      , col = 0, row = 0
      , x, y, xRange, yRange
    _.defaults(opts, {randX: 0, randY: 0})

    _.forEach(this.vertices, function(vertex) {
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

contact = new Cluster({ core: [width/8, height/7] })
news = new Cluster({ core: [0.5 * width, 2 * height/5] })
projects = new Cluster({ core: [7 * width/8, height/7] })

projectsText = createText('PROJECTS', 'projects')
projectsText.on('click', function() { projects.expand() })
newsText = createText('NEWS', 'news')
newsText.on('click', function() { news.expand() })
contactText = createText('funktion.fm', 'contact')
contactText.on('click', function() { contact.expand() })

news._expand = function() {
  var self = this
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

  projects.makeCloud([0.93*width, 0.1*height], 0, 2, 0.5)

  var stoneGradient = gradient = makeGradient([0, 0, 0], [100, 100, 100])
  contact.makePolygon({
    polygon: [
      _.range(6).map(function(i) { return [0, 0.1*width + (6 - i + 1)/6 * 0.2*width] }),
      _.range(10).map(function() { return [0.1*height, 0.6*height] })
    ],
    randX: 5, randY: 20
  }, function(vertex, row, col) {
    if (col === 10 - 1) vertex.pathFill = 'white'
    else vertex.pathFill = stoneGradient(col/10)
  })
  contact.perturbation = 0

  var seaGradient = makeGradient([255, 255, 255], [60, 60, 75])
  news.makePolygon({
    polygon: [
      _.range(10).map(function(i) { return [width/12, 11*width/12] }),
      _.range(6).map(function() { return [3 * height/4, height] })    
    ]
  }, function(vertex, row, col) {
    vertex.pathFill = seaGradient((row === 0) ? 0 : Math.pow(1.35, row) / Math.pow(1.35, 10 - 1))
  })
  news.perturbation = 0.25

  $('#newsBody').slideDown()
  $('#newsTitle').css('top', height/9)
  $('#newsTitle').fadeIn()
  $('#contactBody').fadeOut()
}

projects._expand = function() {
  var self = this, teta
  
}

contact._expand = function() {
  var self = this

  window.location.hash = 'contact'

  _.forEach(clusters, function(cluster) {
    cluster.perturbation = 0.3
  })
  this.makeFlower([width/10, height/15], 600, 0.1)  
  news.makeFlower([0.8 * width, 4 * height/5], 200, 0.1)
  projects.makeFlower([7 * width/8, height/7], 200, 0.1)

  contactText.classed({hidden: true})
  newsText.classed({hidden: false})
  projectsText.classed({hidden: false})

  newsText.moveToPosition([news.core[0] - newsText.text().length * 9, news.core[1] + 7])
  projectsText.moveToPosition([projects.core[0] - projectsText.text().length * 9, projects.core[1] + 7])

  svg.selectAll('text').transition().attr('fill', 'black')

  $('#newsBody').slideUp()
  $('#newsTitle').fadeOut()
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
        case news:
          return 'red'
          break
        case contact:
          return 'blue'
          break
        case projects:
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
      if (allVertices[i].pathFill) {
        d3.select(this).transition().attr('fill', allVertices[i].pathFill).duration(1500)
        d3.select(this).attr('stroke', allVertices[i].pathFill)
        delete allVertices[i].pathFill
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
      news.expand()
      break
    case '#contact':
      contact.expand()
      break
    case '#projects':
      projects.expand()
      break
  }

})
