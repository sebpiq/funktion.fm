var express = require('express')
  , app = express()
  , Poet = require('poet')
  , hbs = require('hbs')
  , fs = require('fs')
  , _ = require('underscore')
  , poet = Poet(app, {
    posts: __dirname + '/_posts/',
    postsPerPage: 5,
    metaFormat: 'json'
  })

app.locals.static = {static: {root: '/'}}
app.set('views', __dirname + '/templates')
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))
app.use(app.routes)

app.listen(3000, function() {
  console.log('listening on port ' + 3000)
})

app.get('/', function (req, res) { res.render('index') })

poet.addRoute('/project/:name', function (req, res, next) {
  var projectName = req.params.name

  if (projectNames.indexOf(projectName) !== -1) {
    res.render('projects/' + projectName, {posts: poet.helpers.postsWithCategory(projectName)})
  } else {
    res.status(404)
    res.send(projectName)
  }

}).init().then(function () {
  console.log('poet running')
})

// Automatically generate the list of project names
var projectNames
fs.readdir(__dirname + '/templates/projects', function(err, files) {
  if (err) throw err
  projectNames = _.filter(files, function(fileName) { return /\w+\.hbs$/.exec(fileName) })
    .map(function(tmplName) {
      return tmplName.substr(0, tmplName.length - ('.hbs'.length))
    })
  console.log('projects found : ', projectNames)
})

hbs.registerHelper('prettifyDate', function(date) {
  return '' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
})
