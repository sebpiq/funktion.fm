"use strict";

const path = require('path')
const fs = require('fs')
const _ = require('underscore')
const async = require('async')
const marked = require('marked')
const handlebars = require('handlebars')

const datesList = require('./datesList.json')
const templatesDir = path.join(__dirname, 'templates')
const publicDir = path.join(__dirname, 'docs')
const compiledPagesDir = path.join(publicDir, '_compiledPages')

marked.setOptions({
  sanitize: false,
  pedantic: true,
  highlight: function (code, lang, callback) {
    require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
      callback(err, result.toString())
    })
  }
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

// Gather all compiled pages here
const _compiledPages = {
  projects: [],
  posts: []
}

async.each(Object.keys(_compiledPages), (subpath, subpathDone) => {
  const subpathDir = path.join(templatesDir, subpath)
  const subpathTemplate = handlebars.compile(fs.readFileSync(subpathDir + '.hbs').toString())
  const namelist = fs.readdirSync(subpathDir)

  async.series([

    // For each md template, parse the markdown and metadata, add it to `_compiledPages`
    // and write the compiled templates to the public folder.
    (next) => {
      async.each(namelist, (filename, fileDone) => {
        const templateFilePath = path.join(templatesDir, subpath, filename)
        const compiledFilePath = path.join(compiledPagesDir, subpath, filename)
        console.log('compiling ' + compiledFilePath)
        async.waterfall([
          (fileNext) => readMarkdown(templateFilePath, fileNext),
          (data, fileNext) => {
            data.metadata.url = {
              subpath: subpath,
              filename: filename,
              basename: path.basename(filename, '.md')
            }
            _compiledPages[subpath][filename] = data
            fs.writeFile(compiledFilePath, subpathTemplate(data), fileNext)
          }
        ], fileDone)
      }, next)

    },

    // Compile the index page
    (next) => {
      const indexPagePath = path.join(publicDir, 'index.html')
      const indexTemplate = handlebars.compile(fs.readFileSync(path.join(templatesDir, 'index.hbs')).toString())
      console.log('compiling ' + indexPagePath)
      const compiled = indexTemplate({
        static: { root: '/' },
        site: { root: '/' },
        dates: datesList,
        projects: _.chain(_compiledPages.projects).values().pluck('metadata').value(),
        posts: _.chain(_compiledPages.posts).values().pluck('metadata')
          .sortBy(function(d) {
            var date = d.date.split('/').reverse()
            return -new Date(date[0], date[1], date[2])
          }).value(),
      })
      fs.writeFile(indexPagePath, compiled, next)
    }

  ], (err) => {
    if (err) throw err
  })

})
