var width = $(window).width(), height = $(window).height(), lineHeight = 20
  , i, allVertices = [], clusters = []
  , tessCount = 60
  , winSize = 10
  , debugTesselations = false
  , r = height/30
  , contact, news, projects

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
  allVertices.unshift(this.core)
  clusters.push(this)

  // Generate a random-ish points :
  // 1) take points evenly distributed on a disc
  // 2) randomize a bit
  var x, y, vertex, teta
  for (i = 1; i < tessCount; i++) {
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

  // Create SVG text element
  this.text = svg.selectAll('text').data(clusters)
    .enter()
    .append('text')
      .text(function(d, i) { return d.text })
      .attr('class', 'menuItem')
      .attr('id', function(d, i) { return d.id })
      .on('click', function() {
        var cluster = d3.select(this).data()[0]
        window.location.hash = cluster.id
        cluster.expand()
      })

  this._updateText()

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
    this._updateText()
  },

  // Function to make appear flower petals from the tesselation
  makeFlower: function(core, r, randomize) {
    this.core[0] = core[0]
    this.core[1] = core[1]
    var self = this
      , paths, corePath
      , isPetal
      , teta, j

    // 'while' is because sometimes voronoi fails : https://github.com/mbostock/d3/issues/1578
    while(true) {
      
      // Move the vertices around the core on `r` and randomized.
      _.forEach(this.vertices, function(vertex, i) {
        teta = i * 2 * Math.PI / tessCount
        vertex.gravityCenter = [
          self.core[0] + r * Math.cos(teta) * (1 - randomize + Math.random() * randomize * 2),
          self.core[1] + r * Math.sin(teta) * (1 - randomize + Math.random() * randomize * 2)
        ]
      })

      // Generate the tesselation paths for the gravity centers of all vertices 
      try {
        paths = d3.geom.voronoi([this.core].concat(_.pluck(this.vertices, 'gravityCenter')))
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
      if (isPetal) self.vertices[i].pathClass = ('q' + (j++ % 4) + ' q')
      else self.vertices[i].pathClass = 'black'
    })
    this.core.pathClass = 'flowerCore'
  },

  makeStar: function(core, randomize, rStep, rStepExp) {
    this.core[0] = core[0]
    this.core[1] = core[1]
    var self = this
      , teta, r, c

    // Move the vertices around the core in a spiral.
    _.forEach(this.vertices, function(vertex, i) {
      teta = (i + Math.random() * randomize * 2 - randomize) * 2 * Math.PI / 8
      r = (i + Math.random() * randomize * 2 - randomize) * Math.pow(rStep, rStepExp)
      vertex.gravityCenter = [
        self.core[0] + r * Math.cos(teta),
        self.core[1] + r * Math.sin(teta)
      ]
      c = Math.round((tessCount - i) / tessCount * 255)
      vertex.pathFill = rgbToHex(c, c, c)
    })
    this.core.pathClass = 'starCore'
  },

  _updateText: function() {
    var self = this
    this.text
      .attr('x', function(d) { return d.core[0] - this.textContent.length * 10 })
      .attr('y', function(d) { return d.core[1] + 7 })
  }

})

contact = new Cluster({ id: 'contact', text: 'funktion.fm', core: [width/8, height/7] })
news = new Cluster({ id: 'news', text: 'NEWS', core: [0.5 * width, 2 * height/5] })
projects = new Cluster({ id: 'projects', text: 'PROJECTS', core: [7 * width/8, height/7] })

news._expand = function() {
  var self = this

  _.forEach(allVertices.slice(clusters.length), function(vertex) { delete vertex.pathClass })
  _.forEach(clusters, function(cluster) {
    cluster.perturbation = 0.5
  })

  this.text.classed({hidden: true})
  this.makeFlower([width/2, -10000], 200, 0)

  projects.text.classed({hidden: false})
  projects.makeStar([7 * width/8, height/7], 0.2, 2, 1.2)

  contact.text.classed({hidden: false})
  contact.makeStar([width/8, height/7], 0.2, 4, 1.2)

  //$('#newsBody').slideDown()
  $('#contactBody').fadeOut()
}

projects._expand = function() {
  var self = this, teta
  
}

contact._expand = function() {
  var self = this

  _.forEach(allVertices.slice(clusters.length), function(vertex) { delete vertex.pathClass })
  _.forEach(clusters, function(cluster) {
    cluster.perturbation = 0.3
  })

  this.text.classed({hidden: true})
  this.makeFlower([width/10, height/15], 600, 0.1)
  
  news.text.classed({hidden: false})
  news.makeFlower([0.8 * width, 4 * height/5], 200, 0.1)

  projects.text.classed({hidden: false})
  projects.makeFlower([7 * width/8, height/7], 200, 0.1)

  $('#newsBody').slideUp()
  $('#contactBody').fadeIn()
}

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
    .attr('class', function(d, i) { return allVertices[i].pathClass })
    .attr('d', function(d) { return String(d.d) })
    .attr('fill', function(d, i) { return allVertices[i].pathFill })
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

var intersects = function(path1, path2) {
  return _.any(path1, function(vertex1) {
    return _.any(path2, function(vertex2) {
      return _.isEqual(vertex1, vertex2)
    })
  })
}

var componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
