var express = require('express')
  , app = express()
  , Poet = require('poet')
  , hbs = require('hbs')
  , fs = require('fs')
  , _ = require('underscore')
  , markdown = require('marked')
  , pygmentize = require('pygmentize-bundled')
  , poet = Poet(app, {
      posts: __dirname + '/_posts',
      postsPerPage: 5,
      readMoreLink: function(post) {
        return '<a href="' + post.url + '" class="readMore">&gt;&gt;&gt;</a>'
      },
      metaFormat: 'json'
    })
  , httpPort = 80
  , datesList = require('./public/datesList.json')

markdown.setOptions({
  sanitize: false,
  pedantic: true,
  highlight: function (code, lang, callback) {
    pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
      callback(err, result.toString())
    })
  }
})

// Add markdown template renderer to add syntax highlighting
poet.addTemplate({
  ext: 'md', 
  fn: function(options, callback) {
    markdown(options.source, callback)
  }
})

app.locals.static = { root: '/' }
app.locals.site = { root: '/' }
app.set('views', __dirname + '/templates')
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))
app.use(app.routes)

app.listen(httpPort, function() {
  console.log('listening on port ' + httpPort)
})

var _renderIndex = function (req, res) {
  res.render('index', { dates: datesList })
}
app.get('/', _renderIndex)
app.get('/contact', _renderIndex)
app.get('/projects', _renderIndex)
app.get('/projects/:slug', _renderIndex)
app.get('/news', _renderIndex)
app.get('/news/:slug', _renderIndex)


hbs.registerHelper('prettifyDate', function(date) {
  return '' + normalizeDateElem(date.getDate()) 
    + '/' + normalizeDateElem((date.getMonth() + 1))
    + '/' + date.getFullYear()
})
var normalizeDateElem = function(elem) {
  elem = elem.toString()
  return (elem.length === 1) ? '0' + elem : elem
}

poet.init().then(function () {
  console.log('poet ready')
})
