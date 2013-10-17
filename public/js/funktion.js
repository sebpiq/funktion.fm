var width = $(window).width(), height = $(window).height(), lineHeight = 20
  , i, allVertices = []
  , tessCount = 60
  , transitionTime = 1500
  , winSize = 10
  , debugTesselations = false
  , r = height/30
  , projectsText, newsText, contactText

// d3 variables
var svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'PiYG')
  , path = svg.append('g').selectAll('path')


var cols = 10, rows = 18
_.forEach(_.range(180), function(i) {
  allVertices.push(new Vertex((i%cols)*width/cols, Math.floor(i/cols)*width/rows))
})

projectsText = createText('PROJECTS', 'projectsText')
projectsText.on('click', function() { expandProjects() })
newsText = createText('NEWS', 'newsText')
newsText.on('click', function() { expandNews() })
contactText = createText('funktion.fm', 'contactText')
contactText.on('click', function() { expandContact() })

var expandNews = function() {
  window.location.hash = 'news'

  var cluster1 = allVertices.slice(0, 60)
    , cluster2 = allVertices.slice(60, 120)
    , cluster3 = allVertices.slice(120, 180)
  _.forEach(allVertices, function(v) { v.perturbation = 0.5 })

  projectsText.classed({hidden: false})
  contactText.classed({hidden: false})
  newsText.classed({hidden: false})

  contactText.moveToPosition([0.01* width, 0.1 * height])
  newsText.moveToPosition([0.01* width, 0.3 * height])
  projectsText.moveToPosition([0.01* width, 0.5 * height])

  svg.selectAll('text').transition().attr('fill', 'white')

  var sunGradient = makeGradient([247, 194, 76], [255, 255, 255])
  makeSpiral(cluster1, {
    core: [0.93*width, 0.1*height],
    randomize: 0,
    rStep: width/930,
    slices: 10,
    computeR: function(rand, context) {
      return (context.r + rand) * (2 + Math.cos(2 * context.teta + Math.PI))
    }
  }, function(vertex, i) {
    vertex.style = {fill: sunGradient(i / tessCount), 'fill-opacity': 1}
  })

  var stoneGradient = gradient = makeGradient([0, 0, 0], [100, 100, 100])
  makePolygon(cluster2, {
    polygon: [
      _.range(6).map(function(i) { return [0, 0.1*width + (6 - i + 1)/6 * 0.2*width] }),
      _.range(10).map(function() { return [0.1*height, 0.6*height] })
    ],
    randX: 5, randY: 20
  }, function(vertex, row, col) {
    if (col === 10 - 1) vertex.style = {fill: 'white', 'fill-opacity': 1}
    else vertex.style = {fill: stoneGradient(col/10), 'fill-opacity': 0.9}
  })
  _.forEach(cluster2, function(v) { v.perturbation = 0 })

  var seaGradient = makeGradient([255, 255, 255], [60, 60, 75])
  makePolygon(cluster3, {
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
  _.forEach(cluster3, function(v) { v.perturbation = 0.25 })

  $('#newsBody').slideDown()
  $('#contactBody').fadeOut()
}

var expandProjects = function() {

  var treeWidth = width/25
    , forrestOffset = width/6
    , treeByRow = 10, forestRows = 3, row = 0
    , treeBase = 0.92 * height
    , treeHeight = 0.03 * height
    , treeCount = 0
    , randX, randY
    // each row has one less tree than the previous, and there is an extra last raw to shape the forrest
    , finalTreeCount = _.reduce(_.range(forestRows+1), function(total, row) { return total + treeByRow - row }, 0)
    , cluster1 = allVertices.slice(0, 80)  // foggy mountain
    , cluster2 = allVertices.slice(80, 80 + 70) // foggy moutain 2
    , cluster3 = allVertices.slice(80 + 70) // fog1

  window.location.hash = 'projects'

  projectsText.classed({hidden: false})
  contactText.classed({hidden: false})
  newsText.classed({hidden: false})

  projectsText.transition().attr({fill: 'black'}).duration(transitionTime)
  contactText.transition().attr({fill: 'black'}).duration(transitionTime)
  newsText.transition().attr({fill: 'black'}).duration(transitionTime)

  contactText.moveToPosition([0.01* width, 0.1 * height])
  newsText.moveToPosition([0.01* width, 0.3 * height])
  projectsText.moveToPosition([0.01* width, 0.5 * height])

  // Foggy mountain1
  var cloudGradient = makeGradient([255, 255, 255], [150, 150, 150])
    , gradientCloudMountain1 = makeGradient([150, 150, 150], [83, 102, 83])
    , gradientCloudMountain2 = makeGradient([150, 150, 150], [47, 94, 47])
  makeSpiral(cluster1, {
    core: [0.75*width, 0.1*height],
    randomize: 0.2,
    rStep: width/800,
    slices: 10,
    computeTeta: function(rand, context) {
      var teta = (context.teta % (2*Math.PI))
      if (Math.PI*0.9 < teta && teta < Math.PI*1.5) context.teta = Math.PI*1.5
      return rand + context.teta
    },
    computeR: function(rand, context) {
      return (rand + context.r) * (1 + Math.abs(Math.cos(context.teta)))
    }
  }, function(vertex, i, r, teta) {
    teta = (teta % (2*Math.PI))
    if (Math.PI*0.2 < teta && teta < Math.PI*0.8)
      vertex.style = {fill: gradientCloudMountain1(i / (2*tessCount)), 'fill-opacity': 1}
    else if (Math.PI < teta && teta < 2*Math.PI)
      vertex.style = {fill: cloudGradient(0.5 * 1 - i / (2*tessCount)), 'fill-opacity': 1}
    else
      vertex.style = {fill: cloudGradient(0.5 + 0.5 * i / (2*tessCount)), 'fill-opacity': 1}
  })
  _.forEach(cluster1, function(v) { v.perturbation = 0.1 })

  // Foggy mountain2
  makeSpiral(cluster2, {
    core: [0.2*width, 0.5*height],
    randomize: 0.2,
    rStep: width/800,
    slices: 13,
    computeTeta: function(rand, context) {
      var teta = (context.teta % (2*Math.PI))
      if ((Math.PI*0.9 < teta && teta < Math.PI*2) || teta < Math.PI*0.1) context.teta = Math.PI*0.1
      return rand + context.teta
    },
    computeR: function(rand, context) {
      return (rand + context.r) * (1 + Math.abs(Math.cos(context.teta)) * 3)
    }
  }, function(vertex, i, r, teta) {
    teta = (teta % (2*Math.PI))
    if (Math.PI*0.2 < teta && teta < Math.PI*0.8)
      vertex.style = {fill: gradientCloudMountain2(i / (2*tessCount)), 'fill-opacity': 1}
    else
      vertex.style = {fill: '#393f39', 'fill-opacity': 1}
  })
  _.forEach(cluster1, function(v) { v.perturbation = 0.1 })

  // Fog1
  var fogCenter = 0.3*width
  makePolygon(cluster3, {
    polygon: [
      _.map(_.range(15), function(i) { return [fogCenter, fogCenter+width/1200] }),
      _.map(_.range(2), function(i) { return [0.05*height + i*0.008*width, 0.3*height + i*0.008*width] })
    ],
    randX: 5
  }, function(vertex, row, col) {
    vertex.style = {fill: cloudGradient(row/13), 'fill-opacity': 1}
  })
  _.forEach(cluster3, function(v) { v.perturbation = 0.02 })
  
  $('#newsBody').slideUp()
  $('#contactBody').fadeOut()

}

var expandContact = function() {
  window.location.hash = 'contact'
  var cluster1 = allVertices.slice(0, 60)
    , cluster2 = allVertices.slice(60, 120)
    , cluster3 = allVertices.slice(120, 180)
    , core1 = [width/10, height/15]
    , core2 = [0.8 * width, 4 * height/5]
    , core3 = [7 * width/8, height/7]

  _.forEach(allVertices, function(v) { v.perturbation = 0.3 })
  makeFlower(cluster1, core1, 600, 0.1)
  makeFlower(cluster2, core2, 200, 0.1)
  makeFlower(cluster3, core3, 200, 0.1)

  contactText.classed({hidden: true})
  newsText.classed({hidden: false})
  projectsText.classed({hidden: false})

  newsText.moveToPosition([core2[0] - newsText.text().length * 9, core2[1] + 7])
  projectsText.moveToPosition([core3[0] - projectsText.text().length * 9, core3[1] + 7])

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
    svg.selectAll('circle').data(allVertices)
      .attr('cx', function (d) { return d[0] })
      .attr('cy', function (d) { return d[1] })
      .attr('fill', function(d) { return d.debugColor })
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

// Animate the thing
drawTesselations()
setInterval(function() {
  _.forEach(allVertices, function(v) { v.nextFrame() })
  drawTesselations()
}, 20)

$(function() {
  switch (window.location.hash) {
    case '#news':
      expandNews()
      break
    case '#contact':
      expandContact()
      break
    case '#projects':
      expandProjects()
      break
  }

})
