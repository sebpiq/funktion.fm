"use strict";

const path = require('path')
const express = require('express')
const app = express()
const Poet = require('poet')
const hbs = require('hbs')
const fs = require('fs')
const _ = require('underscore')
const markdown = require('marked')
const pygmentize = require('pygmentize-bundled')
const poet = Poet(app, {
  posts: __dirname + '/_posts',
  postsPerPage: 5,
  readMoreLink: function(post) {
    return '<a href="' + post.url + '" class="readMore">&gt;&gt;&gt;</a>'
  },
  metaFormat: 'json'
})

const httpPort = 80
const datesList = require('./public/datesList.json')
const templatesDir = path.join(__dirname, '/templates')

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
app.set('views', templatesDir)
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(app.routes)

app.listen(httpPort, function() {
  console.log('listening on port ' + httpPort)
})

function _renderIndex(req, res) {
  res.render('index', { 
    dates: datesList, 
    projects: _.chain(_partials.projects).values().pluck('metadata').value()
  })
}
app.get('/', _renderIndex)
app.get('/contact', _renderIndex)
app.get('/projects', _renderIndex)
app.get('/projects/:slug', _renderIndex)
app.get('/news', _renderIndex)
app.get('/news/:slug', _renderIndex)

// View to return partials from compiled markdown
app.get('/_partials/:subpath/:filename', function(req, res) {
  res.render(req.params.subpath, _partials[req.params.subpath][req.params.filename])
})

hbs.registerHelper('prettifyDate', function(date) {
  return '' + normalizeDateElem(date.getDate()) 
    + '/' + normalizeDateElem((date.getMonth() + 1))
    + '/' + date.getFullYear()
})

function normalizeDateElem(elem) {
  elem = elem.toString()
  return (elem.length === 1) ? '0' + elem : elem
}

function readMarkdown(filePath) {
  let metadataRegex = /\{\{\{((.|\n)*)\}\}\}/
  let raw = fs.readFileSync(filePath).toString()
  let metadata = JSON.parse('{' + raw.match(metadataRegex)[1] + '}')
  raw = raw.replace(metadataRegex, '')
  let rendered = markdown(raw)
  return { metadata: metadata, content: rendered }
}

const _partials = {
  projects: []
}

Object.keys(_partials).forEach((subpath) => {
  fs.readdirSync(path.join(templatesDir, subpath)).forEach((filename) => {
    let filePath = path.join(templatesDir, subpath, filename)
    _partials[subpath][filename] = readMarkdown(filePath)
  })
})

poet.init().then(function () {
  console.log('poet ready')
})
