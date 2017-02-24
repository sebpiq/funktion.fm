module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        src: '/tmp/browserified.js',
        dest: 'public/js/funktion.fm.js'
      }
    },

    less: {
      prod: {
        files: {
          'public/css/funktion.fm.css': 'frontend/less/funktion.fm.less'
        }
      }
    },

    browserify: {
      dist: {
        files: {
          '/tmp/browserified.js': ['frontend/main.js'],
        }
      }
    },

    copy: {
      main: {
        files: [
          {src: ['/tmp/browserified.js'], dest: 'public/js/funktion.fm.js', filter: 'isFile'}
        ]
      }
    },

    watch: {
      scripts: {
        files: [
          'frontend/**/*.js',
          'frontend/*.js',
          'frontend/less/*.less',
          'Gruntfile.js'
        ],
        tasks: ['devBuild'],
        options: {
          spawn: false,
        },
      },
    },


  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-browserify')

  grunt.registerTask('default', ['less', 'browserify', 'uglify'])
  grunt.registerTask('devBuild', ['less', 'browserify', 'copy'])

}
