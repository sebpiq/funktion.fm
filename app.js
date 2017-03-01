"use strict";

const path = require('path')
const express = require('express')
const app = express()
const hbs = require('hbs')
const fs = require('fs')
const _ = require('underscore')
const marked = require('marked')

const httpPort = 80
const datesList = require('./public/datesList.json')
const templatesDir = path.join(__dirname, '/templates')

marked.setOptions({
  sanitize: false,
  pedantic: true,
  highlight: function (code, lang, callback) {
    require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
      callback(err, result.toString())
    })
  }
})

app.locals.static = { root: '/' }
app.locals.site = { root: '/' }
app.set('views', templatesDir)
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(app.routes)

// Redirect for old urls probably linked somwhere else online
app.get('/projects/fields-infos', function(req, res) { res.redirect(301, '/projects/murmurate') })

// Single-page view
function _renderIndex(req, res) {
  res.render('index', { 
    dates: datesList, 
    projects: _.chain(_partials.projects).values().pluck('metadata').value(),
    posts: _.chain(_partials.posts).values().pluck('metadata')
      .sortBy(function(d) { 
        var date = d.date.split('/').reverse()
        return -new Date(date[0], date[1], date[2])
      }).value(),    
  })
}
app.get('/', _renderIndex)
app.get('/contact', _renderIndex)
app.get('/projects', _renderIndex)
app.get('/projects/:slug', _renderIndex)
app.get('/news', _renderIndex)
app.get('/news/:slug', _renderIndex)


// View to return partials from compiled marked
app.get('/_partials/:subpath/:filename', function(req, res) {
  res.render(req.params.subpath, _partials[req.params.subpath][req.params.filename])
})

// Code to get and parse the .md files
function readMarkdown(filePath, done) {
  let metadataRegex = /\{\{\{((.|\n)*)\}\}\}/
  let raw = fs.readFileSync(filePath).toString()
  let metadata = JSON.parse('{' + raw.match(metadataRegex)[1] + '}')
  raw = raw.replace(metadataRegex, '')
  marked(raw, function (err, rendered) {
    if (err) return done(err)
    else done(null, { metadata: metadata, content: rendered })
  })
}

const _partials = {
  projects: [],
  posts: []
}

Object.keys(_partials).forEach((subpath) => {
  fs.readdirSync(path.join(templatesDir, subpath)).forEach((filename) => {
    let filePath = path.join(templatesDir, subpath, filename)
    readMarkdown(filePath, (err, data) => {
      data.metadata.url = { 
        subpath: subpath, 
        filename: filename, 
        basename: path.basename(filename, '.md') 
      }
      _partials[subpath][filename] = data
    })
  })
})

app.listen(httpPort, function() {
  console.log('listening on port ' + httpPort)
})
