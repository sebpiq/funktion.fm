var express = require('express')
  , app = express()
  , Poet = require('poet')
  , hbs = require('hbs')
  , poet = Poet(app, {
    posts: __dirname + '/_posts/',
    postsPerPage: 5,
    metaFormat: 'json'
  })

poet.init().then(function () {
  console.log('poet running')
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

hbs.registerHelper('prettifyDate', function(date) {
  return '' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
})
