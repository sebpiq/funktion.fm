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

app.get('/', function (req, res) { 
  res.render('index', {dates: [
    {date: '28/09/2016', projectName: 'Murmurate', projectUrl: '#/projects/fields-infos', venue: 'Sight and Sound festival, Montreal, Canada'},
    {date: '19/08/2016', projectName: 'Atmosphere | La Jetée', projectUrl:'https://www.edef.co.uk/event/8/', venue: 'Assembly Rooms, Edinburgh, Scotland'},
    {date: '19-21/08/2016', projectName: 'Freedom Portal', projectUrl:'http://apo33.org/electropixel/index.php/2016/08/20/tim-shaw-sebastien-piquemal/', venue: 'Electropixel, Nantes, France'},
    {date: '01/07/2016', projectName: 'Murmurate', projectUrl: '#/projects/fields-infos', venue: 'The Wired Lab, Wagga-Wagga, Australia'},
    {date: '14/05/2016', projectName: 'Murmurate', projectUrl: '#/projects/fields-infos', venue: 'Cumberland Arms, Newcastle, England'},
    {date: '13/05/2016', projectName: 'Murmurate', projectUrl: '#/projects/fields-infos', venue: 'FACT, Liverpool, England'},
    {date: '20/04/2016', projectName: 'Murmurate', projectUrl: '#/projects/fields-infos', venue: 'Stereolux, Nantes, France'},
    {date: '13/04/2016', projectName: 'Fields Workshop', projectUrl: '#/projects/fields-infos', venue: 'Stereolux, Nantes, France'},
    {date: '11/04/2016', projectName: 'Residency Stereolux', projectUrl: '#/projects', venue: 'Stereolux, Nantes, France'},
    {date: '19/11/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Piksel festival, Bergen, Norway'},
    {date: '10/10/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Connect the Dots festival, Sheffield, England'},
    {date: '26/09/2015', projectName: 'Murmurate', projectUrl: '#/projects/murmurate', venue: 'Sanctuary, Galloway, Scotland'},
    {date: '15/08/2015', projectName: 'New Weave', projectUrl: '#/projects/newweave', venue: 'Flow festival, Helsinki, Finland'},
    {date: '02/06/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'NIME, Baton Rouge, USA'},
    {date: '20/05/2015', projectName: 'New Weave', projectUrl: '#/projects/newweave', venue: 'Vapaan Taiteen Tila, Helsinki, Finland'},
    {date: '23/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Durham Castle, Durham, England'},
    {date: '22/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Islington Mill, Manchester, England'},
    {date: '19/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Ulverston Parish Rooms, Ulverston, England'},
    {date: '17/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'EAVI, Goldsmiths, London, England'},
    {date: '16/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Music Hack Space, London, England'},
    {date: '14/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'The Louisiana Cellar, Bristol, England'},
    {date: '12/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Cafe OTO, London, England'},
    {date: '11/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Other Worlds Festival, Blackpool, England'},
    {date: '09/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Green Door Store, Brighton, England'},
    {date: '09/04/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'University of Sussex, Brighton, England'},
    {date: '27/01/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'WAC, Ircam, Paris, France'},
    {date: '24/01/2015', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Gap in the Air, Edinburgh, Scotland'},
    {date: '22/01/2015', projectName: 'New Weave', projectUrl: '#/projects/newweave', venue: 'Third Space, Helsinki, Finland'},
    {date: '23/11/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'ICLI, Zé Dos Bois, Lisbo, Portugal'},
    {date: '27/10/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'NordiCHI, Helsinki, Finland'},
    {date: '25/10/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Third Space, Helsinki, Finland'},
    {date: '10/10/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'NK, Berlin, Germany'},
    {date: '19/09/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'ICMC, Athens, Greece'},
    {date: '22/06/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Mining Institute, Newcastle-upon-Tyne, England'},
    {date: '08/04/2014', projectName: 'Fields', projectUrl: '#/projects/fields-infos', venue: 'Arkadia bookstore, Helsinki, Finland'}
  ]}) 
})

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
