{{{
  "title" : "Getting Started with Poet",
  "tags" : [ "node.js", "poet" ],
  "category" : "node.js",
  "date" : "9-29-2012",
  "description" : "A brief introduction to the node.js module, Poet, to quickly create your own blog."
}}}

Last week at [Node Philly](http://node.ph), we had a hack-and-meet event, where there were tutorials on the HTTP module in node, using Express, and having released and presented [Poet](https://github.com/jsantell/poet) at the previous meetup, I helped out those going through the set up. Here's the tutorial I wrote for a hack and covers everything, so once you have node and npm installed with no further knowledge, you should be able to follow along and get a blog up and running!
<img src="/img/posts/poet_small.png" class="center" alt="poet" />

<!--more-->

## Requirements

* node
* npm

I'm currently on npm 1.1.4 and node 0.8.1, but just have somewhat recent installs of node and npm and you'll be fine. This minihack goes over setting up a simple express app and tying poet into it. It uses jade templating, so if you're unfamiliar with it, no problem -- but hopefully you check it out and see how awesome it is.

## Set up your project

First things first, make a directory for your new project, and then copy the `views`, `public` and `_posts` directory from the example app on the [NodePhilly GitHub MiniHacks page](https://github.com/NodePhilly/MiniHacks/tree/master/2012.09/poet/app). These will just get us started with some templates for our blog, and sample posts so we can see when it's working.

## Set up your package.json


Your [package.json](https://npmjs.org/doc/json.html) is the manifest for your node app. You can manage dependencies and set up meta for publishing to npm, and tie in test scripts and other cool stuff. Check out [npm's resource](https://npmjs.org/doc/json.html) on the package.json file for everything you can put in there.

For now, we'll just start with a basic manifest file with name, version number, specify that this is private (we don't want to accidently publish this to npm!) and our dependencies: [Express](https://github.com/visionmedia/express), [Jade](https://github.com/visionmedia/jade), and [Poet](https://github.com/jsantell/poet). Save this `package.json` in your project's root directory. We'll also add a value for "main" so we can just run our app with `node .`, which looks at our package.json to determine the entry point for our app. Hot, right?

<pre>
{
  "name" : "myPoetMiniHack",
  "version" : "0.0.1",
  "main" : "server.js",
  "private" : true,
  "dependencies" : {
    "poet"    : ">= 0.1.6",
    "jade"    : ">= 0.27.5",
    "express" : "= 3.0.0rc5"
  }
}
</pre>

Note your `package.json` has to be a valid JSON file. The dependencies allow us to grab any version of Poet greater than 0.1.6, and the latest Express version, 3.0.0rc5 (at the time of writing, version 3 of Express is still in release candidate).

Once you have your package json, you can simply install dependencies to your project directory by firing off the `npm install` command. This will install a `node_modules` directory in your project's directory storing the dependencies you just installed. Modules are small, so we shouldn't worry about having our modules contained locally for each of our projects -- this saves headache and dependency hell down the road when one of our apps is using Express 2.0 and another Express 3.0.

## Setting up the app

So we have our dependencies in our project directory. [Express](http://expressjs.com) is a simple, popular web application framework so we don't have to deal with lower level node modules and we can easily set up routes and content. Leveraging Express, Poet sets up some auto routes for you if you'd like, and interfaces directly with Express. Knowing this, we can set up our `server.js` file in our project root.

<pre>
// server.js
var
  express = require('express'),
  app     = express(),
  poet    = require('poet')( app );
</pre>

So we grab the express module in our `node_modules` directory, which returns a function that returns an express app object. Poet also is a function that we have to pass in the Express app into to get our Poet interface.

Below our includes, we're going to set up some Express settings with `app.set`.

<pre>
// server.js
var
  express = require('express'),
  app     = express(),
  poet    = require('poet')( app );

app.set( 'view engine', 'jade' );
app.set( 'views', __dirname + '/views' );
app.use( express.static( __dirname + '/public' ) );
app.use( app.router );
</pre>

So those new 4 lines, we just set Express to use the Jade templating engine, because it's HAML-like and badass, and our view folder so we can call our view templates without having to specify `/views` everytime.

`app.use` is the middleware for express. Every request that comes in goes through a chain of middleware to determine its end result. Think of it like guitar being plugged into a series of pedal effects. First we include the express static middleware to serve static content in our `/public` directory, like CSS and image files. Then we put the express router at the end to handle the routes we'll define next.

After that, we'll define our main index route and tell Express to listen on port 3000.

<pre>
app.get( '/', function ( req, res ) { res.render( 'test' ); });
app.listen( 3000 );
</pre>

We define the route for when the URL is `/`, or the root and tell the response to render our test view. Since we already set the view engine to jade, we don't need to say `test.jade`, and we also set our view directory to `__dirname + '/views'`, so we also don't need to specify the full path.

## RUN THAT HOTNESS

Okay, so we just got a basic Express app up that should server our `test.jade` file when we go to `localhost:3000`. Let's give it a go by running `node .` in our project's directory and go to `localhost:3000` in your browser.

If everything is going good, you should see the text **HOORAY! EXPRESS IS RUNNING!** -- if not, something is broken :)

## Now time to plug in Poet...

We confirmed that our app is correctly serving up content via Express, but now lets tie in Poet's auto route generation. Right before we set our express variables, lets drop in Poet's autoroutes. also, let's render our index.jade file instead of test.jade. here is the complete code:

<pre>
// server.js
var
  express = require('express'),
  app     = express(),
  poet    = require('poet')( app );

poet
  .createPostRoute()
  .createPageRoute()
  .createTagRoute()
  .createCategoryRoute()
  .init();

app.set( 'view engine', 'jade' );
app.set( 'views', __dirname + '/views' );
app.use( express.static( __dirname + '/public' ) );
app.use( app.router );

app.get( '/', function ( req, res ) { res.render( 'index' ); });
app.listen( 3000 );
</pre>

Perfect. Now let's fire up our app again with `node .` and visit `localhost:3000` -- you should see a listing with one blog post, with tags and categories listed on the side.

## Your Own Posts

At this point, we have an Express app using Poet's route generators and can start removing the sample posts and adding our own, but we can dig around a bit to see how all this works.

Each of the posts are prefixed by front matter. If you used Jekyll before, it's the same deal here (except that uses YAML, which can also be used in Poet). In this case, the default is JSON.

<pre>
{{{
  "title" : "Hello World.js",
  "tags"  : [ "blog", "fun" ],
  "category" : "javascript",
  "date" : "8-9-2012"
}}}

Here goes the content that belongs to the blog post.
Blawg blawg blawg blawg.
</pre>

We can specify a title for our blog, category, an array of tags and a date in JSON (which is triple-enclosed by curly brackets). What is below is our blog post that is rendered to the page. Remove the default posts and add your own and restart your node application to see them in action.

## Change your view templates

Poet provides several variables to your view templates, called locals. Check out `/views/post.jade`. In an individual post, the post variable contains all the metadata you put in the front matter for your post -- this is where your title, date, tags, and any other arbitrary information comes from. Post locals also have additional information such as `url`, `content` and `preview` related to the specific post.

Checking out the main layout file, `/views/layout.jade`, we can see locals exposed such as `categoryList` and `categoryUrl` which are available to all routes. For a full list of locals exposed in all view templates, and on specific routes, check out the [Poet documentation](http://jsantell.github.com/poet#locals).


