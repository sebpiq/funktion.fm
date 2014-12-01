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
        return '<a href="#' + post.url + '" class="readMore">&gt;&gt;&gt;</a>'
      },
      metaFormat: 'json'
    })

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

app.locals.static = { static: { root: '/' }, site: { root: '/' } }
app.set('views', __dirname + '/templates')
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))
app.use(app.routes)

app.listen(80, function() {
  console.log('listening on port ' + 80)
})

app.get('/', function (req, res) { res.render('index') })

// Test if Fields is supported
app.get('/fields/is_supported', function (req, res) { res.render('fields/is_supported') })

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
